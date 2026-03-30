const Sentry = require('@sentry/node');
const CONFIG = require('./config');

if (CONFIG.env.SENTRY_DSN) {
  Sentry.init({
    dsn: CONFIG.env.SENTRY_DSN,
    environment: CONFIG.env.NODE_ENV,
    tracesSampleRate: CONFIG.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

const captureException = (err) => {
  if (CONFIG.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
};

const setupExpressErrorHandler = (app) => {
  if (CONFIG.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }
};

module.exports = {
  captureException,
  setupExpressErrorHandler,
};
