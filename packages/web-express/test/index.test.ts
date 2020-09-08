import * as request from 'supertest';
import { closeApp, creatApp } from './utils';
import { IMidwayExpressApplication } from '../src';

describe('/test/feature.test.ts', () => {

  describe('test new features', () => {
    let app: IMidwayExpressApplication;
    beforeAll(async () => {
      app = await creatApp('base-app');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test get method with return value', async () => {
      const result = await request(app).get('/').query({ name: 'harry' });
      expect(result.status).toBe(201);
      expect(result.text).toBe('hello world,harry');
    });

    it('test get method with redirect', async () => {
      const result = await request(app).get('/login');
      expect(result.status).toBe(302);
    });
  });

});
