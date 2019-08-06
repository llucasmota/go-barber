import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res
      .status(401)
      .json({ error: { message: 'Token is not provided' } });
  }

  const [, token] = auth.split(' ');
  try {
    const decodedJwt = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decodedJwt.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Token invalid' } });
  }
};
