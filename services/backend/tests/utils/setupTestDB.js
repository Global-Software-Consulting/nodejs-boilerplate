const mongoose = require('mongoose');
const { CONFIG } = require('../../src/config');

const setupTestDB = () => {
  beforeAll(async () => {
    const mongoUrl = CONFIG.env.MONGODB_URL + (CONFIG.env.NODE_ENV === 'test' ? '-test' : '');
    await mongoose.connect(mongoUrl);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany()));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;
