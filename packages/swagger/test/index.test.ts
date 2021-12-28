import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  describe('test swagger', () => {

    let app;
    beforeAll(async () => {
      try {
        app = await createApp(join(__dirname, 'fixtures/cats'), {}, koa);
      } catch (e) {
        console.log(e);
        console.log('beforeAll: ' +  e.stack);
      }
    });

    afterAll(async () => {
      await close(app);
    });

    it('should get swagger json', async () => {
      let ret = await createHttpRequest(app).get('/swagger-ui/index.html');
      expect(ret.type).toEqual('text/html');
      expect(ret.text).toContain('html');
      
      ret = await createHttpRequest(app).get('/swagger-ui/swagger-ui.js');
      expect(ret.type).toEqual('application/javascript');
      expect(ret.text).toContain('!function');

      ret = await createHttpRequest(app).get('/swagger-ui/swagger-ui.css');
      expect(ret.type).toEqual('text/css');
      expect(ret.text).toContain('.swagger-ui{color:#3b4151');

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      expect(result.type).toEqual('application/json');
      const body = result.body;
      console.log('--->', result.text);

      expect(body.tags).toStrictEqual([{"name":"cats1","description":""}]);
      expect(body.components.securitySchemes).toStrictEqual({"bbb":{"type":"http","scheme":"basic"},"ttt":{"type":"http","scheme":"bearer","bearerFormat":"JWT"}})
    });
  });
});