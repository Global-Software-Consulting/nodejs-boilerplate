const { Op } = require('sequelize');
const SequelizeBaseRepository = require('./SequelizeBaseRepository');

class UserRepository extends SequelizeBaseRepository {
  _serialize(doc) {
    const json = super._serialize(doc);
    if (json) delete json.password;
    return json;
  }

  async isEmailTaken(email, excludeUserId) {
    const where = { email };
    if (excludeUserId) {
      where.id = { [Op.ne]: excludeUserId };
    }
    const user = await this.model.findOne({ where });
    return !!user;
  }
}

module.exports = UserRepository;
