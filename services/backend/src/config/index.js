const CONFIG = require('./config');
const logger = require('./logger');
const { morganSuccessHandler, morganErrorHandler } = require('./morgan');
const sentry = require('./sentry');
const { jwtStrategy } = require('./passport');
const { roles, roleRights } = require('./roles');
const { tokenTypes } = require('./tokens');

module.exports = {
  CONFIG,
  logger,
  morganSuccessHandler,
  morganErrorHandler,
  sentry,
  jwtStrategy,
  roles,
  roleRights,
  tokenTypes,
};
