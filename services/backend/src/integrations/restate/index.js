const { greeter } = require('./service');
const { getClient } = require('./client');
const { startRestateServer } = require('./server');

module.exports = { greeter, getClient, startRestateServer };
