const BaseRepository = require('../BaseRepository');

/* eslint-disable class-methods-use-this */
class SequelizeBaseRepository extends BaseRepository {
  constructor(model) {
    super();
    this.model = model;
  }

  _serialize(doc) {
    if (!doc) return null;
    const json = doc.toJSON();
    delete json.createdAt;
    delete json.updatedAt;
    return json;
  }

  async create(data) {
    const doc = await this.model.create(data);
    return this._serialize(doc);
  }

  async findById(id) {
    const doc = await this.model.findByPk(id);
    return this._serialize(doc);
  }

  async findOne(filter) {
    const doc = await this.model.findOne({ where: filter });
    return this._serialize(doc);
  }

  async findOneRaw(filter) {
    const doc = await this.model.findOne({ where: filter, raw: true });
    if (!doc) return null;
    delete doc.createdAt;
    delete doc.updatedAt;
    return doc;
  }

  async paginate(filter, options) {
    let order = [['createdAt', 'ASC']];
    if (options.sortBy) {
      order = options.sortBy.split(',').map((sortOption) => {
        const [key, dir] = sortOption.split(':');
        return [key, dir === 'desc' ? 'DESC' : 'ASC'];
      });
    }

    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const offset = (page - 1) * limit;

    const { count: totalResults, rows } = await this.model.findAndCountAll({
      where: filter,
      order,
      limit,
      offset,
    });

    return {
      results: rows.map((doc) => this._serialize(doc)),
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  }

  async updateById(id, data) {
    const doc = await this.model.findByPk(id);
    if (!doc) return null;
    await doc.update(data);
    return this._serialize(doc);
  }

  async updateMany(filter, data) {
    await this.model.update(data, { where: filter });
  }

  async deleteById(id) {
    const doc = await this.model.findByPk(id);
    if (!doc) return null;
    const serialized = this._serialize(doc);
    await doc.destroy();
    return serialized;
  }

  async deleteMany(filter) {
    await this.model.destroy({ where: filter });
  }

  async insertMany(docs) {
    await this.model.bulkCreate(docs);
  }

  async count(filter) {
    return this.model.count({ where: filter });
  }

  async clearAll() {
    await this.model.destroy({ where: {} });
  }
}

module.exports = SequelizeBaseRepository;
