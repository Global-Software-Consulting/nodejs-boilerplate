const moment = require('moment');
const { CONFIG, tokenTypes } = require('../../src/config');
const tokenService = require('../../src/modules/v1/auth/token.service');
const { userOne, admin } = require('./user.fixture');

const accessTokenExpires = moment().add(CONFIG.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
const { token: userOneAccessToken } = tokenService.generateToken(userOne.id, accessTokenExpires, tokenTypes.ACCESS);
const { token: adminAccessToken } = tokenService.generateToken(admin.id, accessTokenExpires, tokenTypes.ACCESS);

module.exports = {
  userOneAccessToken,
  adminAccessToken,
};
