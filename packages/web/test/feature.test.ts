import { closeApp, creatApp, originalCreateApp, createHttpRequest, matchContentTimes, sleep } from './utils';
import { IMidwayWebApplication } from '../src';
import { join } from 'path';
import { remove, existsSync } from 'fs-extra';
import { readFileSync } from 'fs';
import * as qs from 'qs';

describe('/test/feature.test.ts', () => {
  describe('test new decorator', () => {
    let app: IMidwayWebApplication;
    beforeAll(async () => {
      app = await creatApp('feature/base-app');
    });

    afterAll(async () => {
      await closeApp(app);
    });

    it('test setHeader decorator', async () => {
      const result = await createHttpRequest(app)
        .get('/set_header')
        .query({ name: 'harry' });
      expect(result.status).toEqual(200);
      expect(result.text).toEqual('bbb');
      expect(result.headers['bbb']).toEqual('aaa');
      expect(result.headers['ccc']).toEqual('ddd');
    });

    it('test get status 204', async () => {
      const result = await createHttpRequest(app).get('/204');
      expect(result.status).toEqual(204);
    });

    it('test get method with return value', async () => {
      const result = await createHttpRequest(app)
        .get('/')
        .query({ name: 'harry' });
      expect(result.status).toEqual(201);
      expect(result.text).toEqual('hello world,harry');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpRequest(app).get('/login');
      expect(result.status).toEqual(302);
    });

    it('test get data with ctx.body', async () => {
      const result = await createHttpRequest(app).get('/ctx-body');
      expect(result.text).toEqual('ctx-body');
    });

    it.skip('should compatible old get router method', async () => {
      const prioritySortRouters = (app.loader as any).framework.prioritySortRouters;
      for (const router of prioritySortRouters) {
        for (const layer of router['router'].stack) {
          console.log(layer.paramNames);
          console.log(layer.name);
          console.log(layer.path);
          console.log(layer.methods);
        }
      }
    });
  });

  it('should test global use midway middleware id in egg', async () => {
    const app = await originalCreateApp('feature/base-app-middleware');
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('11112222333344445555egg_middleware');
    await closeApp(app);
  });

  it('should got component config in app', async () => {
    const app = await creatApp('feature/base-app-component-config');
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('hello world1');
    await closeApp(app);
  });

  it('should got plugin in app middleware and controller', async () => {
    const app = await creatApp('feature/base-app-plugin-inject');
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('hello worldaaaa1aaaa');
    await closeApp(app);
  });

  it('should test set custom logger in egg by midway logger', async () => {
    await remove(join(__dirname, 'fixtures/feature/base-app-set-ctx-logger', 'logs'));
    const app = await creatApp('feature/base-app-set-ctx-logger');
    const result = await createHttpRequest(app)
      .get('/')
      .query({ name: 'harry' });
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world,harry');
    await sleep();
    expect(matchContentTimes(join(app.getAppDir(), 'logs', 'ali-demo', 'midway-web.log'), 'GET abcde')).toEqual(5);
    expect(matchContentTimes(join(app.getAppDir(), 'logs', 'ali-demo', 'midway-web.log'), 'abcde] custom label')).toEqual(1);
    await closeApp(app);
  });

  it('should use midway logger ignore replaceEggLogger config', async () => {
    const app = await creatApp('feature/base-app-egg-logger');
    await closeApp(app);
  });

  it('should test not found will got 404', async () => {
    const app = await creatApp('feature/base-app-404');
    const result = await createHttpRequest(app)
      .get('/error');
    expect(result.status).toEqual(404);
    await closeApp(app);
  });

  it('should test middleware return value and body not empty', async () => {
    const app = await creatApp('feature/base-app-middleware-return-body');
    const result = await createHttpRequest(app)
      .get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('{"code":0,"msg":"ok","data":null}');

    const result1 = await createHttpRequest(app)
      .get('/undefined');
    expect(result1.status).toEqual(200);
    expect(result1.text).toEqual('{"code":0,"msg":"ok"}');

    const result2 = await createHttpRequest(app)
      .get('/null');
    expect(result2.status).toEqual(200);
    expect(result2.text).toEqual('{"code":0,"msg":"ok","data":null}');
    await closeApp(app);
  });

  it('should test query parser #2162', async () => {
    const app = await creatApp('feature/base-app-query-parser');
    let result = await createHttpRequest(app)
      .get('/query_array')
      .query({
        appId: '31062',
        flowId: '1330',
        mixFlowInstIds: ['108015365', '108015366'],
        flowInstIds: ['103137222', '103137223']
      });
    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify({"appId":"31062","flowId":"1330","mixFlowInstIds":["108015365","108015366"],"flowInstIds":["103137222","103137223"]}));

    result = await createHttpRequest(app)
      .get('/query_array_duplicate?appId=123&appId=456');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify({"appId":["123","456"]}));
    await closeApp(app);
  });

  it('should test query parser #2162 case 2', async () => {
    const app = await creatApp('feature/base-app-query-parser');
    let result = await createHttpRequest(app)
      .get('/query_array?appId=31062&flowId=1330&mixFlowInstIds[]=108015365&flowInstIds[]=103137222');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify({"appId":"31062","flowId":"1330","mixFlowInstIds":["108015365"],"flowInstIds":["103137222"]}));

    result = await createHttpRequest(app)
      .get('/query_array_duplicate?appId=123&appId=456');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify({"appId":["123","456"]}));
    await closeApp(app);
  });

  it('should test query parser options', async () => {
    const query5 = {
      arr: ['1','2','3','4','5'],
    };
    const app = await creatApp('feature/base-app-query-parser');
    let result = await createHttpRequest(app)
      .get('/query_array')
      .query(qs.stringify(query5));
    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify(query5));

    const query6 = {
      arr: ['1','2','3','4','5','6'],
    };
    result = await createHttpRequest(app)
      .get('/query_array')
      .query(qs.stringify(query6));

    expect(result.status).toEqual(200);
    expect(result.text).toEqual(JSON.stringify(qs.parse(qs.stringify(query6), { arrayLimit: 5 })));
    await closeApp(app);
  });

  it('should test runInAgent decorator with egg', async () => {
    const resultFile = join(__dirname, 'fixtures/feature/base-app-run-in-agent', '.result');
    await remove(resultFile);
    expect(existsSync(resultFile)).toBeFalsy();

    const app = await creatApp('feature/base-app-run-in-agent');
    expect(existsSync(resultFile)).toBeTruthy();

    expect(readFileSync(resultFile, {encoding: 'utf8'})).toEqual('success');
    await closeApp(app);
  });

  it('should test http forward', async () => {
    const app = await creatApp('feature/base-app-forward');
    let result = await createHttpRequest(app)
      .get('/exists');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('exists');

    result = await createHttpRequest(app)
      .get('/not-exists');

    expect(result.status).toEqual(404);

    result = await createHttpRequest(app)
      .get('/forward-function');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world');

    await closeApp(app);
  });

  it('should use logger v3 and get correct logger file', async () => {
    const logFiles = join(__dirname, 'fixtures/feature/base-app-logger-v3', 'logs');
    await remove(logFiles);
    const app = await creatApp('feature/base-app-logger-v3');
    await sleep(1000);


    const webLogger = join(logFiles, 'ali-demo', 'midway-web.log');
    const appLogger = join(logFiles, 'ali-demo', 'midway-app.log');
    const customLogger = join(logFiles, 'custom.log');
    const abcLogger = join(logFiles,  'ali-demo', 'abc.log');

    expect(existsSync(webLogger)).toBeTruthy();
    expect(existsSync(appLogger)).toBeFalsy();
    expect(existsSync(customLogger)).toBeTruthy();
    expect(existsSync(abcLogger)).toBeTruthy();

    expect(readFileSync(webLogger, {encoding: 'utf8'})).toMatch(/框架默认的 app 日志，应该输出到 midway-web.log/);
    expect(readFileSync(customLogger, {encoding: 'utf8'})).toMatch(/egg 自定义 logger，应该输出到 custom.log/);
    expect(readFileSync(abcLogger, {encoding: 'utf8'})).toMatch(/midway 自定义 logger，应该输出到 abc.log/);
    await closeApp(app);

  });
});
