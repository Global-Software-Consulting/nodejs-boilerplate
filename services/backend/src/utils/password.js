const bcrypt = require('bcryptjs');

const hashPassword = async (password) => bcrypt.hash(password, 8);

const comparePassword = async (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hashPassword, comparePassword };
