import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res
        .status(400)
        .json({ error: { message: 'User already exists' } });
    }

    const { id, email, name, provider } = await User.create(req.body);
    return res.json({ id, email, name, provider });
  }

  async update(req, res) {
    const user = await User.findByPk(req.userId);
    /**
     * email and password need different validation, but
     * all the attributes can be changed
     */
    const { email, oldPassword } = req.body;

    if (email && email !== user.email) {
      const emailExist = await User.findOne({ where: { email } });
      if (emailExist) {
        return res
          .status(400)
          .json({ error: { message: 'User already exists' } });
      }
    }
    /**
     * Só realizo o checkPassword se a senha estiver no request
     */
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: { message: 'Invalid password' } });
    }
    const { id, name, provider } = await user.update(req.body);
    return res.status(200).json({ id, email, name, provider });
  }
}

export default new UserController();
