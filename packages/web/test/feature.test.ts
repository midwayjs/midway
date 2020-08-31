import * as request from 'supertest';
import { creatApp } from './utils';
import {clearAllModule} from "@midwayjs/decorator";

xdescribe('/test/feature.test.ts', () => {

  afterEach(clearAllModule);

  describe('test new features', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('feature/base-app');
    })

    it('test get method with return value', async () => {
      const result = await request(app.callback()).get('/').query({name: 'harry'});
      expect(result.status).toBe(201);
      expect(result.text).toBe('hello world,harry');
    });

    it('test get method with redirect', async () => {
      const result = await request(app.callback()).get('/login');
      expect(result.status).toBe(302);
    });
  })

});
