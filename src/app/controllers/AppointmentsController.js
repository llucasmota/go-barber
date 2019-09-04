import * as Yup from 'yup';
import { isBefore, startOfHour, parseISO } from 'date-fns';
import Appointment from '../models/Appointments';
import User from '../models/User';

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

    if (isProvider) {
      return res.status(401).json({
        error: { message: 'You can only create Appointments with providers' },
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
    return res.json({ appointment });
  }
}
export default new AppointmentsController();
