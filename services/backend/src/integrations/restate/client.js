const restate = require('@restatedev/restate-sdk');
const { CONFIG } = require('../../config');

const getClient = () => restate.clients.connect(CONFIG.env.RESTATE_INGRESS_URL);

module.exports = { getClient };
