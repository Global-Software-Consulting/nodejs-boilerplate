const client = require('./client');

const helloWorld = client.createFunction(
  { id: 'hello-world', name: 'Hello World' },
  { event: 'app/hello.world' },
  async ({ event, step }) => {
    const result = await step.run('greeting', () => `Hello, ${event.data.name ?? 'world'}!`);
    return { message: result };
  },
);

module.exports = [helloWorld];
