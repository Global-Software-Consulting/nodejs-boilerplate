const MongooseBaseRepository = require('./MongooseBaseRepository');

class UserRepository extends MongooseBaseRepository {
  async isEmailTaken(email, excludeUserId) {
    const user = await this.model.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
  }
}

module.exports = UserRepository;
