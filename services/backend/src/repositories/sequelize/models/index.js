const defineUser = require('./User');
const defineToken = require('./Token');

let User;
let Token;

const initModels = (sequelize) => {
  User = defineUser(sequelize);
  Token = defineToken(sequelize);
  return { User, Token };
};

const getModels = () => ({ User, Token });

module.exports = { initModels, getModels };
