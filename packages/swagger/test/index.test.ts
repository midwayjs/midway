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
      const ret = await createHttpRequest(app).get('/swagger-ui/index.html');
      expect(ret.type).toEqual('text/html');
      expect(ret.text).toContain('html');

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      console.log('---->', result.text);
      expect(result.type).toEqual('application/json');
    });
  });
});