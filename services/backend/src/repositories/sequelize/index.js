const { getConnection } = require('./connection');
const { initModels } = require('./models');
const UserRepository = require('./UserRepository');
const TokenRepository = require('./TokenRepository');

let models;

const createRepositories = () => {
  const sequelize = getConnection();
  models = initModels(sequelize);
  return {
    userRepository: new UserRepository(models.User),
    tokenRepository: new TokenRepository(models.Token),
  };
};

const connect = async () => {
  const sequelize = getConnection();
  if (!models) initModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync();
};

const disconnect = async () => {
  const sequelize = getConnection();
  await sequelize.close();
};

module.exports = { createRepositories, connect, disconnect };
