const morgan = require('morgan');
const CONFIG = require('./config');
const logger = require('./logger');
const { getCorrelationId } = require('../middlewares/correlationId');

morgan.token('message', (req, res) => res.locals.errorMessage || '');
morgan.token('correlation-id', () => getCorrelationId() || '-');

const getIpFormat = () => (CONFIG.env.NODE_ENV === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}[:correlation-id] :method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}[:correlation-id] :method :url :status - :response-time ms - message: :message`;

const morganSuccessHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

const morganErrorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

module.exports = {
  morganSuccessHandler,
  morganErrorHandler,
};
