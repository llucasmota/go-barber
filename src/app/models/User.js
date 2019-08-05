import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        /**
         * Criei um campo virtual para que a senha encriptada seja criada pela
         * aplicação e o cliente envia apenas o campo virtual
         */
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  checkPassword(password) {
    /**
     * o método compare do bcrypt verifica se o password informado está correto
     */
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
