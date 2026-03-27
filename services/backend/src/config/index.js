const CONFIG = require('./config/config.config');
const logger = require('./logger/logger.config');
const { jwtStrategy } = require('./passport/passport.config');
const { roles, roleRights } = require('./roles/roles.config');
const { tokenTypes } = require('./tokens/tokens.config');

module.exports = {
  CONFIG,
  logger,
  jwtStrategy,
  roles,
  roleRights,
  tokenTypes,
};
