const { Connection, Client } = require('@temporalio/client');
const { CONFIG } = require('../../config');

let client;

const getClient = async () => {
  if (client) return client;
  const connection = await Connection.connect({ address: CONFIG.env.TEMPORAL_ADDRESS });
  client = new Client({ connection });
  return client;
};

module.exports = { getClient };
