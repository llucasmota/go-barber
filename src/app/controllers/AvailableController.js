import { startOfDay, endOfDay } from 'date-fns';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: { message: 'Date é obrigatório' } });
    }
    const searchDate = Number(date);
    return res.json({ searchDate });
  }
}
export default new AvailableController();
