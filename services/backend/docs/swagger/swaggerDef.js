const { version } = require('../../package.json');
const { CONFIG } = require('../../src/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'GSoft Backend API',
    version,
    description: 'GSoft backend service API documentation',
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${CONFIG.env.PORT}/v1`,
      description: 'Local development server',
    },
  ],
};

module.exports = swaggerDef;
