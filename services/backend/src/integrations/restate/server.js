const restate = require('@restatedev/restate-sdk');
const { greeter } = require('./service');
const { logger } = require('../../config');

const startRestateServer = async (port = 9080) => {
  const server = restate.endpoint().bind(greeter).listen(port);
  logger.info(`Restate HTTP endpoint listening on port ${port}`);
  return server;
};

module.exports = { startRestateServer };
