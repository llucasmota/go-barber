import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointment from '../models/Appointments';

class ScheduleController {
  async index(req, res) {
    const user = await User.findOne({
      where: { id: req.userId, provider: true },
    });
    /**
     * Check if user is provider
     */
    if (!user) {
      return res
        .status(401)
        .json({ error: { message: 'Only providers can view' } });
    }
    const { date } = req.query;

    const parseDate = parseISO(date);

    const schedule = await Appointment.findAll({
      where: {
        provider_id: user.id,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json({ schedule });
  }
}
export default new ScheduleController();
