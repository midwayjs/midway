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
      console.log('--->', JSON.stringify(body));

      expect(body.tags.length).toBeGreaterThanOrEqual(2);
      expect(body.tags).toStrictEqual([{"name":"1-你好这里","description":""},{"name":"2-国家测试","description":""},{"description":"","name":"sss"}]);
      expect(body.components.securitySchemes).toStrictEqual({"bbb":{"type":"http","scheme":"basic"},"ttt":{"type":"http","scheme":"bearer","bearerFormat":"JWT"}})
      expect(body.components.schemas.CatT).toMatchSnapshot();
      expect(body.components.schemas.Catd).toMatchSnapshot();
      expect(body.components.schemas.Cata).toMatchSnapshot();
      expect(body.components.schemas.Cat).toMatchSnapshot();
      expect(body.components.schemas.CreateCatDto).toMatchSnapshot();
      expect(body.paths['/cats/{id}']).toMatchSnapshot();
    });
  });

  it('should fix issue1976', async () => {
    const app = await createApp(join(__dirname, 'fixtures/issue1976'), {});
    const result = await createHttpRequest(app).get('/swagger-ui/index.json');
    expect(result.type).toEqual('application/json');
    const body = result.body;
    expect(body).toMatchSnapshot();
    console.log(JSON.stringify(body));
    await close(app);
  });

  it('should fix issue2603', async () => {
    const app = await createApp(join(__dirname, 'fixtures/issue2603'), {});
    const result = await createHttpRequest(app).get('/swagger-ui/index.json');
    expect(result.type).toEqual('application/json');
    const body = result.body;
    expect(body).toMatchSnapshot();
    console.log(JSON.stringify(body));
    await close(app);
  });
});
