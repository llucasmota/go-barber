import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointments';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: { message: 'Date é obrigatório' } });
    }
    const searchDate = Number(date);
    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    return res.json(appointments);
  }
}
export default new AvailableController();
