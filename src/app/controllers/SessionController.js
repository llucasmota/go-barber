import jwt from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { message: 'user not found' } });
    }
    if (!(await user.checkPassword(password))) {
      return res
        .status(401)
        .json({ error: { message: 'password does not match' } });
    }
    const { id, name } = user;

    return res.json(
      /**
       * o jwt.sign recebe:
       * o dado do usuário que eu quero inserir,
       * uma frase única
       */
      {
        user: { id, name, email },
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      }
    );
  }
}

export default new SessionController();
