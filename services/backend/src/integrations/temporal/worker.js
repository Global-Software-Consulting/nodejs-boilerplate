const { Worker } = require('@temporalio/worker');
const { CONFIG, logger } = require('../../config');
const activities = require('./activities');

const startWorker = async () => {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'gsoft-tasks',
    connection: { address: CONFIG.env.TEMPORAL_ADDRESS },
  });
  logger.info('Temporal worker started');
  await worker.run();
};

module.exports = { startWorker };
