const mongoose = require('mongoose');
const app = require('./app');
const { CONFIG, logger, sentry } = require('./config');
const { startWorkers } = require('./integrations');

let server;
const mongoUrl = CONFIG.env.MONGODB_URL + (CONFIG.env.NODE_ENV === 'test' ? '-test' : '');
mongoose.connect(mongoUrl).then(async () => {
  logger.info('Connected to MongoDB');

  // Start workflow engine workers (if configured)
  await startWorkers();

  server = app.listen(CONFIG.env.PORT, () => {
    logger.info(`Listening to port ${CONFIG.env.PORT}`);
  });
});

const exitHandler = () => {
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

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
