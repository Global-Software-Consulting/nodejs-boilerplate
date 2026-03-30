const { connect, disconnect, clearAll } = require('../../src/repositories');

const setupTestDB = () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearAll();
  });

  afterAll(async () => {
    await disconnect();
  });
};

module.exports = setupTestDB;
