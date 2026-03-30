const BaseRepository = require('../BaseRepository');

/* eslint-disable class-methods-use-this */
class MongooseBaseRepository extends BaseRepository {
  constructor(model) {
    super();
    this.model = model;
  }

  _mapId(data) {
    if (data.id !== undefined) {
      const { id, ...rest } = data;
      return { ...rest, _id: id };
    }
    return data;
  }

  _toJSON(doc) {
    if (!doc) return null;
    const json = doc.toJSON();
    // Ensure ObjectId refs are serialized as strings
    Object.keys(json).forEach((key) => {
      if (json[key] && json[key]._bsontype === 'ObjectId') {
        json[key] = json[key].toString();
      }
    });
    return json;
  }

  async create(data) {
    const mapped = this._mapId(data);
    const doc = await this.model.create(mapped);
    return this._toJSON(doc);
  }

  async findById(id) {
    const doc = await this.model.findById(id);
    return this._toJSON(doc);
  }

  async findOne(filter) {
    const doc = await this.model.findOne(filter);
    return this._toJSON(doc);
  }

  async findOneRaw(filter) {
    const doc = await this.model.findOne(filter).lean();
    if (!doc) return null;
    doc.id = doc._id.toString();
    return doc;
  }

  async paginate(filter, options) {
    const result = await this.model.paginate(filter, options);
    return {
      ...result,
      results: result.results.map((doc) => this._toJSON(doc)),
    };
  }

  async updateById(id, data) {
    const doc = await this.model.findById(id);
    if (!doc) return null;
    Object.assign(doc, data);
    await doc.save();
    return this._toJSON(doc);
  }

  async updateMany(filter, data) {
    await this.model.updateMany(filter, { $set: data });
  }

  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id);
    return this._toJSON(doc);
  }

  async deleteMany(filter) {
    await this.model.deleteMany(filter);
  }

  async insertMany(docs) {
    const mapped = docs.map((doc) => this._mapId(doc));
    await this.model.insertMany(mapped);
  }

  async count(filter) {
    return this.model.countDocuments(filter);
  }

  async clearAll() {
    await this.model.deleteMany({});
  }
}

module.exports = MongooseBaseRepository;
