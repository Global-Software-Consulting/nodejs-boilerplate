const { CONFIG, logger } = require('../config');
const inngest = require('./inngest');
const temporal = require('./temporal');
const restate = require('./restate');

const loadIntegrations = (app) => {
  // Inngest — event-driven durable execution
  if (CONFIG.env.INNGEST_EVENT_KEY) {
    app.use('/api/inngest', inngest.handler);
    logger.info('Inngest integration mounted at /api/inngest');
  }
};

const startWorkers = async () => {
  // Temporal — workflow orchestration
  if (CONFIG.env.TEMPORAL_ADDRESS) {
    temporal.startWorker().catch((err) => logger.error('Temporal worker failed:', err));
  }

  // Restate — durable execution
  if (CONFIG.env.RESTATE_INGRESS_URL) {
    restate.startRestateServer().catch((err) => logger.error('Restate server failed:', err));
  }
};

module.exports = { loadIntegrations, startWorkers };
