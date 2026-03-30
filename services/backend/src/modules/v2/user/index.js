const userController = require('./user.controller');
const userService = require('./user.service');
const User = require('./user.model');
const userValidation = require('./user.validation');
const userRoutes = require('./user.routes');

module.exports = { userController, userService, User, userValidation, userRoutes };
