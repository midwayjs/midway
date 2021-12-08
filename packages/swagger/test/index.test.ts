import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  describe('test swagger', () => {

    let app;
    beforeAll(async () => {
      app = await createApp(join(__dirname, 'fixtures/cats'), {}, koa);
    });

    afterAll(async () => {
      await close(app);
    });

    it('should get swagger json', async () => {
      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      console.log(JSON.stringify(result.body));
      expect(result.type).toEqual('application/json');
    });

  });

});