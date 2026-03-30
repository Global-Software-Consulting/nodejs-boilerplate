const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status').default;
const { CONFIG, morganSuccessHandler, morganErrorHandler, sentry, jwtStrategy } = require('./config');
const { authLimiter, correlationId, errorConverter, errorHandler } = require('./middlewares');
const v1Routes = require('./modules/v1');
const v2Routes = require('./modules/v2');
const { ApiError } = require('./utils');

const app = express();

// correlation ID — must run before morgan/logging
app.use(correlationId());

if (CONFIG.env.NODE_ENV !== 'test') {
  app.use(morganSuccessHandler);
  app.use(morganErrorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// prevent HTTP parameter pollution
app.use(hpp());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (CONFIG.env.NODE_ENV === 'production') {
  app.use('/v1/auth', authLimiter);
  app.use('/v2/auth', authLimiter);
}

// api routes
app.use('/v1', v1Routes);
app.use('/v2', v2Routes);

// dev-only docs route
if (CONFIG.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  app.use('/v1/docs', require('./docs.route'));
}

// workflow engine integrations (conditional)
const { loadIntegrations } = require('./integrations');

loadIntegrations(app);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Sentry error handler — must be before custom error middleware
sentry.setupExpressErrorHandler(app);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
