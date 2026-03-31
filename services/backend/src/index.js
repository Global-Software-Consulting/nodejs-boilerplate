const app = require('./app');
const { CONFIG, logger, sentry } = require('./config');
const { startWorkers } = require('./integrations');
const { connect, disconnect } = require('./repositories');

let server;

(async () => {
  await connect();
  logger.info('Database connected');
  await startWorkers();
  server = app.listen(CONFIG.env.PORT, () => {
    logger.info(`Listening to port ${CONFIG.env.PORT}`);
  });
})();

const exitHandler = async () => {
  await disconnect().catch(() => {});
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  sentry.captureException(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await disconnect().catch(() => {});
  if (server) {
    server.close();
  }
});
