const request = require('supertest');
const httpStatus = require('http-status').default;
const app = require('../../src/app');
const { CONFIG } = require('../../src/config');

describe('Auth routes', () => {
  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      CONFIG.env.NODE_ENV = 'production';
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
      CONFIG.env.NODE_ENV = process.env.NODE_ENV;
    });
  });
});
