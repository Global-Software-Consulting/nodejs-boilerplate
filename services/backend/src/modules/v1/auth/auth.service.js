const httpStatus = require('http-status').default;
const tokenService = require('./token.service');
const userService = require('../user/user.service');
const { getTokenRepository } = require('../../../repositories');
const { ApiError } = require('../../../utils');
const { comparePassword } = require('../../../utils/password');
const { tokenTypes } = require('../../../config');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const rawUser = await userService.getUserByEmailForAuth(email);
  if (!rawUser || !(await comparePassword(password, rawUser.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return userService.getUserById(rawUser.id);
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await getTokenRepository().findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await getTokenRepository().deleteById(refreshTokenDoc.id);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await getTokenRepository().deleteById(refreshTokenDoc.id);
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    // Reuse detection: if the token is valid JWT but already deleted from DB,
    // someone may be replaying a stolen token — blacklist all refresh tokens for the user
    if (error.statusCode === httpStatus.UNAUTHORIZED && error.message === 'Token not found') {
      try {
        const decoded = tokenService.decodeToken(refreshToken);
        if (decoded?.sub) {
          await getTokenRepository().updateMany({ user: decoded.sub, type: tokenTypes.REFRESH }, { blacklisted: true });
        }
      } catch {
        // ignore decode failures
      }
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await getTokenRepository().deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await getTokenRepository().deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
