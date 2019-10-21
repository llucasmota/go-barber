import * as Yup from 'yup';
import { isBefore, startOfHour, parseISO, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointments';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';
import CancelationMail from '../jobs/CancelationMail';

class AppointmentsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: { message: 'Validation fails' } });
    }
    const { provider_id, date } = req.body;
    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: { message: 'You can only create Appointments with providers' },
      });
    }
    if (req.userId === provider_id) {
      return res.status(401).json({
        error: {
          message: 'You cannot create appointment when the provider is you!',
        },
      });
    }
    /**
     * startOfHour ignora os minutos e analisa apenas a hora e a data, o parseISO
     * transforma o valor em um tipo date do JS.
     * O if verifica o valor passado é menor que o atual
     */
    const hour = startOfHour(parseISO(date));
    if (isBefore(hour, new Date())) {
      return res
        .status(400)
        .json({ error: { message: 'Past dates aren`t permitted' } });
    }
    /**
     * Verificando se há um agendamento com as mesmas características
     */
    const checkRepeatAppoint = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date,
      },
    });
    if (checkRepeatAppoint) {
      return res
        .status(400)
        .json({ error: { message: 'Appointment date is not available' } });
    }
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    const user = await User.findByPk(req.userId);
    const formatDate = format(hour, "'dia' dd 'de' MMMM', às' HH:mm'h'", {
      locale: pt,
    });
    /**
     * Notify provider
     */
    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formatDate}`,
      user: provider_id,
    });
    return res.json({ appointment });
  }

  /**
   * Consulta
   */
  async index(req, res) {
    /**
     * Pagination
     */
    const { page = 1 } = req.query;
    /**
     * Searching for appointments
     */
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'past'],
      limit: 20,
      /**
       * Caso a página seja igual a 1: apresenta 20
       * Caso seja 2 irá pular 20 e apresentar as próximas 20
       */
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              /**
               * Necessário passa o path nos attributes, pois a url utiliza o path no retorno
               */
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    if (!appointments) {
      return res.status(400).json({ error: { message: 'No results' } });
    }
    return res.json({ appointments });
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      return res
        .status(400)
        .json({ error: { message: 'Not exist appointment' } });
    }
    /**
     * Verifica se o usuário que está tentando alterar é dono da marcação
     */
    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: { message: 'Only owner can cancel ' } });
    }

    /**
     * O cliente poderá desmarcar até duas horas antes
     */
    const maxTimeForCancel = subHours(appointment.date, 2);
    /**
     * A hora do agendamento - 2
     * está pelo menos 2 horas antes da hora atual?
     */
    if (isBefore(maxTimeForCancel, new Date())) {
      return res.status(401).json({
        error: {
          message: 'You can only cancel appointments 2 hours in advance.',
        },
      });
    }
    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancelationMail.key, { appointment });

    return res.json(appointment);
  }
}
export default new AppointmentsController();
