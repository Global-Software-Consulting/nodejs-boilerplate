const winston = require('winston');
const CONFIG = require('./config');
const { getCorrelationId } = require('../middlewares/correlationId');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const addCorrelationId = winston.format((info) => {
  const cid = getCorrelationId();
  if (cid) {
    Object.assign(info, { correlationId: cid });
  }
  return info;
});

const devFormat = winston.format.combine(
  enumerateErrorFormat(),
  addCorrelationId(),
  winston.format.colorize(),
  winston.format.splat(),
  winston.format.printf(({ level, message, correlationId: cid }) => {
    const prefix = cid ? `[${cid}] ` : '';
    return `${level}: ${prefix}${message}`;
  }),
);

const prodFormat = winston.format.combine(
  enumerateErrorFormat(),
  addCorrelationId(),
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: CONFIG.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: CONFIG.env.NODE_ENV === 'development' ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

module.exports = logger;
