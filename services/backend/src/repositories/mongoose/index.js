const mongoose = require('mongoose');
const { CONFIG } = require('../../config');
const UserRepository = require('./UserRepository');
const TokenRepository = require('./TokenRepository');

let User;
let Token;

const loadModels = () => {
  if (!User) {
    // eslint-disable-next-line global-require
    User = require('../../modules/v1/user/user.model');
  }
  if (!Token) {
    // eslint-disable-next-line global-require
    Token = require('../../modules/v1/auth/token.model');
  }
};

const createRepositories = () => {
  loadModels();
  return {
    userRepository: new UserRepository(User),
    tokenRepository: new TokenRepository(Token),
  };
};

const connect = async () => {
  await mongoose.connect(CONFIG.env.MONGODB_URL);
};

const disconnect = async () => {
  await mongoose.disconnect();
};

module.exports = { createRepositories, connect, disconnect };
