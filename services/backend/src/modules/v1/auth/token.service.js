const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status').default;
const { CONFIG, tokenTypes } = require('../../../config');
const userService = require('../user/user.service');
const Token = require('./token.model');
const { ApiError } = require('../../../utils');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {{ token: string, jti: string }}
 */
const generateToken = (userId, expires, type, secret = CONFIG.env.JWT_SECRET) => {
  const jti = randomUUID();
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    jti,
  };
  return { token: jwt.sign(payload, secret), jti };
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @param {Object} [meta] - Optional metadata { jti, ip, userAgent }
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false, meta = {}) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
    ...meta,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, CONFIG.env.JWT_SECRET);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(CONFIG.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
  const { token: accessToken } = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(CONFIG.env.JWT_REFRESH_EXPIRATION_DAYS, 'days');
  const { token: refreshToken, jti } = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, false, { jti });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(CONFIG.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES, 'minutes');
  const { token: resetPasswordToken, jti } = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD, false, { jti });
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(CONFIG.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES, 'minutes');
  const { token: verifyEmailToken, jti } = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL, false, { jti });
  return verifyEmailToken;
};

/**
 * Decode a token without verifying expiry (for reuse detection)
 * @param {string} token
 * @returns {Object|null}
 */
const decodeToken = (token) => {
  try {
    return jwt.verify(token, CONFIG.env.JWT_SECRET, { ignoreExpiration: true });
  } catch {
    return null;
  }
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  decodeToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
