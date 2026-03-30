const restate = require('@restatedev/restate-sdk');

const greeter = restate.service({
  name: 'greeter',
  handlers: {
    greet: async (ctx, name) => `Hello, ${name ?? 'world'}!`,
  },
});

module.exports = { greeter };
