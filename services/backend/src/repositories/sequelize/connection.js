const { Sequelize } = require('sequelize');
const { CONFIG } = require('../../config');

let sequelize;

const getConnection = () => {
  if (!sequelize) {
    if (CONFIG.env.NODE_ENV === 'test') {
      sequelize = new Sequelize('sqlite::memory:', { logging: false });
    } else {
      sequelize = new Sequelize(CONFIG.env.DATABASE_URL, { logging: false });
    }
  }
  return sequelize;
};

module.exports = { getConnection };
