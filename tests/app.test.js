const request = require('supertest');
const { app, server } = require('../src/app');

describe('Express App', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Hello, GitHub Actions!');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/users', () => {
    it('should return users list', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users).toHaveLength(2);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.statusCode).toBe(404);
    });
  });
});
