/* eslint-disable class-methods-use-this */
class BaseRepository {
  async create(_data) {
    throw new Error('Not implemented');
  }

  async findById(_id) {
    throw new Error('Not implemented');
  }

  async findOne(_filter) {
    throw new Error('Not implemented');
  }

  async findOneRaw(_filter) {
    throw new Error('Not implemented');
  }

  async paginate(_filter, _options) {
    throw new Error('Not implemented');
  }

  async updateById(_id, _data) {
    throw new Error('Not implemented');
  }

  async updateMany(_filter, _data) {
    throw new Error('Not implemented');
  }

  async deleteById(_id) {
    throw new Error('Not implemented');
  }

  async deleteMany(_filter) {
    throw new Error('Not implemented');
  }

  async insertMany(_docs) {
    throw new Error('Not implemented');
  }

  async count(_filter) {
    throw new Error('Not implemented');
  }

  async clearAll() {
    throw new Error('Not implemented');
  }

  async beforeCreate(data) {
    return data;
  }

  async beforeUpdate(_id, data) {
    return data;
  }

  toJSON(_doc) {
    throw new Error('Not implemented');
  }
}

module.exports = BaseRepository;
