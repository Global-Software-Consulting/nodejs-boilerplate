const { serve } = require('inngest/express');
const client = require('./client');
const functions = require('./functions');

const handler = serve({ client, functions });

module.exports = handler;
