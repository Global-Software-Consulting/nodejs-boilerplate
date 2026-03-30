const authController = require('./auth.controller');
const authService = require('./auth.service');
const tokenService = require('./token.service');
const authValidation = require('./auth.validation');
const authRoutes = require('./auth.routes');

module.exports = { authController, authService, tokenService, authValidation, authRoutes };
