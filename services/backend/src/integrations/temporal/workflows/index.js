const { proxyActivities } = require('@temporalio/workflow');

const { greet } = proxyActivities({ startToCloseTimeout: '1 minute' });

const greetingWorkflow = async (name) => greet(name);

module.exports = { greetingWorkflow };
