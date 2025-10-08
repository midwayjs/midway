import { createLegacyApp as creatApp, close as closeApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayExpressApplication } from '../src';

describe('test/versioning.test.ts', () => {
  describe('URI versioning', () => {
    let app: IMidwayExpressApplication;

    beforeAll(async () => {
      app = await creatApp('versioning');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('should handle v1 API requests', async () => {
      const result = await createHttpRequest(app).get('/v1/users');

      expect(result.status).toBe(200);
      expect(result.body.version).toBe('v1');
      expect(Array.isArray(result.body.users)).toBe(true);
      expect(result.body.users.length).toBe(1);
      expect(result.body.users[0].name).toBe('John');
    });

    it('should handle v2 API requests', async () => {
      const result = await createHttpRequest(app).get('/v2/users');

      expect(result.status).toBe(200);
      expect(result.body.version).toBe('v2');
      expect(result.body.data).toBeDefined();
      expect(result.body.data.meta).toBeDefined();
      expect(result.body.data.users.length).toBe(1);
    });

    it('should handle POST requests with versioning', async () => {
      const newUser = { name: 'Jane', email: 'jane@example.com' };

      // Test v1 endpoint
      const v1Response = await createHttpRequest(app)
        .post('/v1/users')
        .send(newUser);

      expect(v1Response.status).toBe(200);
      expect(v1Response.body.version).toBe('v1');
      expect(v1Response.body.user.name).toBe('Jane');
      expect(v1Response.body.user.id).toBe(2);

      // Test v2 endpoint
      const v2Response = await createHttpRequest(app)
        .post('/v2/users')
        .send(newUser);

      expect(v2Response.status).toBe(200);
      expect(v2Response.body.version).toBe('v2');
      expect(v2Response.body.data.user.name).toBe('Jane');
      expect(v2Response.body.meta.created).toBeDefined();
    });

    it('should return 404 for routes without version prefix', async () => {
      const result = await createHttpRequest(app).get('/users');
      expect(result.status).toBe(404);
    });

    it('should return 404 for non-existent versions', async () => {
      const result = await createHttpRequest(app).get('/v3/users');
      expect(result.status).toBe(404);
    });

    it('should handle different HTTP methods with versioning', async () => {
      // Test GET
      let result = await createHttpRequest(app).get('/v1/users');
      expect(result.status).toBe(200);

      result = await createHttpRequest(app).get('/v2/users');
      expect(result.status).toBe(200);

      // Test POST
      result = await createHttpRequest(app).post('/v1/users').send({ name: 'Test' });
      expect(result.status).toBe(200);

      result = await createHttpRequest(app).post('/v2/users').send({ name: 'Test' });
      expect(result.status).toBe(200);
    });
  });

  describe('Version configuration validation', () => {
    let app: IMidwayExpressApplication;

    beforeAll(async () => {
      app = await creatApp('versioning');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('should correctly apply version prefixes to routes', async () => {
      // Verify that the correct version prefixes are applied
      const v1Response = await createHttpRequest(app).get('/v1/users');
      expect(v1Response.status).toBe(200);
      expect(v1Response.body.version).toBe('v1');

      const v2Response = await createHttpRequest(app).get('/v2/users');
      expect(v2Response.status).toBe(200);
      expect(v2Response.body.version).toBe('v2');
    });

    it('should handle versioning with different route paths', async () => {
      // Both controllers use '/users' as base path but should be accessible via versioned paths
      let result = await createHttpRequest(app).get('/v1/users');
      expect(result.status).toBe(200);

      result = await createHttpRequest(app).get('/v2/users');
      expect(result.status).toBe(200);

      // Verify they return different response structures
      const v1Response = await createHttpRequest(app).get('/v1/users');
      const v2Response = await createHttpRequest(app).get('/v2/users');

      expect(v1Response.body.version).toBe('v1');
      expect(v2Response.body.version).toBe('v2');
      expect(v1Response.body).not.toEqual(v2Response.body);
    });
  });

  describe('Edge cases and error handling', () => {
    let app: IMidwayExpressApplication;

    beforeAll(async () => {
      app = await creatApp('versioning');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('should handle malformed version requests', async () => {
      // Invalid version format
      let result = await createHttpRequest(app).get('/vX/users');
      expect(result.status).toBe(404);

      result = await createHttpRequest(app).get('/v/users');
      expect(result.status).toBe(404);

      result = await createHttpRequest(app).get('/v1.5/users');
      expect(result.status).toBe(404);
    });

    it('should handle empty request bodies correctly', async () => {
      // Test with empty body
      const v1Response = await createHttpRequest(app).post('/v1/users').send({});
      expect(v1Response.status).toBe(200);
      expect(v1Response.body.version).toBe('v1');

      const v2Response = await createHttpRequest(app).post('/v2/users').send({});
      expect(v2Response.status).toBe(200);
      expect(v2Response.body.version).toBe('v2');
    });
  });
});