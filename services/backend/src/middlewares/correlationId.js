const { AsyncLocalStorage } = require('async_hooks');
const { randomUUID } = require('crypto');

const asyncLocalStorage = new AsyncLocalStorage();

const HEADER = 'x-correlation-id';

const correlationId = () => (req, res, next) => {
  const id = req.headers[HEADER] || randomUUID();
  res.setHeader(HEADER, id);
  asyncLocalStorage.run(id, () => next());
};

const getCorrelationId = () => asyncLocalStorage.getStore() || null;

module.exports = { correlationId, getCorrelationId, HEADER };
