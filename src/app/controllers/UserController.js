import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.json({ resultado: { message: 'O usuário já existe' } });
    }

    const user = await User.create(req.body);
    return res.json(user);
  }
}

export default new UserController();
