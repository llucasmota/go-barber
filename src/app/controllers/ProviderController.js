import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar', // alias
        },
      ],
    });
    if (!providers) {
      return res
        .status(400)
        .json({ error: { message: 'Not exists providers' } });
    }
    return res.json(providers);
  }
}

export default new ProviderController();
