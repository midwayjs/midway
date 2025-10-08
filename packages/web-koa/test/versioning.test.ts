import { closeApp, creatApp, createHttpRequest } from './utils';

describe('test/versioning.test.ts', () => {
  describe('URI versioning', () => {
    let app: any;

    beforeAll(async () => {
      app = await creatApp('versioning');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('should handle v1 API requests', async () => {
      const request = createHttpRequest(app);

      const response = await request.get('/v1/users').expect(200);

      expect(response.body.version).toBe('v1');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0].name).toBe('John');
    });

    it('should handle v2 API requests', async () => {
      const request = createHttpRequest(app);

      const response = await request.get('/v2/users').expect(200);

      expect(response.body.version).toBe('v2');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.meta).toBeDefined();
      expect(response.body.data.users.length).toBe(1);
    });

    it('should handle POST requests with versioning', async () => {
      const request = createHttpRequest(app);

      const newUser = { name: 'Jane', email: 'jane@example.com' };

      // Test v1 endpoint
      const v1Response = await request
        .post('/v1/users')
        .send(newUser)
        .expect(200);

      expect(v1Response.body.version).toBe('v1');
      expect(v1Response.body.user.name).toBe('Jane');
      expect(v1Response.body.user.id).toBe(2);

      // Test v2 endpoint
      const v2Response = await request
        .post('/v2/users')
        .send(newUser)
        .expect(200);

      expect(v2Response.body.version).toBe('v2');
      expect(v2Response.body.data.user.name).toBe('Jane');
      expect(v2Response.body.meta.created).toBeDefined();
    });

    it('should return 404 for routes without version prefix', async () => {
      const request = createHttpRequest(app);

      await request.get('/users').expect(404);
    });

    it('should return 404 for non-existent versions', async () => {
      const request = createHttpRequest(app);

      await request.get('/v3/users').expect(404);
    });

    it('should handle different HTTP methods with versioning', async () => {
      const request = createHttpRequest(app);

      // Test GET
      await request.get('/v1/users').expect(200);
      await request.get('/v2/users').expect(200);

      // Test POST
      await request.post('/v1/users').send({ name: 'Test' }).expect(200);
      await request.post('/v2/users').send({ name: 'Test' }).expect(200);
    });
  });

  describe('Version configuration validation', () => {
    let app: any;

    beforeAll(async () => {
      app = await creatApp('versioning');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('should correctly apply version prefixes to routes', async () => {
      const request = createHttpRequest(app);

      // Verify that the correct version prefixes are applied
      const v1Response = await request.get('/v1/users').expect(200);
      expect(v1Response.body.version).toBe('v1');

      const v2Response = await request.get('/v2/users').expect(200);
      expect(v2Response.body.version).toBe('v2');
    });

    it('should handle versioning with different route paths', async () => {
      const request = createHttpRequest(app);

      // Both controllers use '/users' as base path but should be accessible via versioned paths
      await request.get('/v1/users').expect(200);
      await request.get('/v2/users').expect(200);

      // Verify they return different response structures
      const v1Response = await request.get('/v1/users');
      const v2Response = await request.get('/v2/users');

      expect(v1Response.body.version).toBe('v1');
      expect(v2Response.body.version).toBe('v2');
      expect(v1Response.body).not.toEqual(v2Response.body);
    });
  });

  describe('Edge cases and error handling', () => {
    let app: any;

    beforeAll(async () => {
      app = await creatApp('versioning');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('should handle malformed version requests', async () => {
      const request = createHttpRequest(app);

      // Invalid version format
      await request.get('/vX/users').expect(404);
      await request.get('/v/users').expect(404);
      await request.get('/v1.5/users').expect(404);
    });

    it('should handle empty request bodies correctly', async () => {
      const request = createHttpRequest(app);

      // Test with empty body
      const v1Response = await request.post('/v1/users').send({}).expect(200);
      expect(v1Response.body.version).toBe('v1');

      const v2Response = await request.post('/v2/users').send({}).expect(200);
      expect(v2Response.body.version).toBe('v2');
    });
  });
});