let userRepository;
let tokenRepository;
let adapterModule;

const loadAdapter = () => {
  const adapter = process.env.DB_ADAPTER;
  if (!adapter) {
    throw new Error('DB_ADAPTER env var is required. Set to "mongoose" or "sequelize".');
  }
  // eslint-disable-next-line global-require, import/no-dynamic-require, security/detect-non-literal-require
  adapterModule = require(`./${adapter}`);
  return adapterModule;
};

const initRepositories = () => {
  if (!adapterModule) loadAdapter();
  const repos = adapterModule.createRepositories();
  userRepository = repos.userRepository;
  tokenRepository = repos.tokenRepository;
};

const getUserRepository = () => {
  if (!userRepository) initRepositories();
  return userRepository;
};

const getTokenRepository = () => {
  if (!tokenRepository) initRepositories();
  return tokenRepository;
};

const connect = async () => {
  if (!adapterModule) loadAdapter();
  await adapterModule.connect();
};

const disconnect = async () => {
  if (adapterModule) {
    await adapterModule.disconnect();
  }
};

const clearAll = async () => {
  await getUserRepository().clearAll();
  await getTokenRepository().clearAll();
};

module.exports = { initRepositories, getUserRepository, getTokenRepository, connect, disconnect, clearAll };
