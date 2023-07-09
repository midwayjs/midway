import {
  close,
  createApp,
  createLightApp,
  createHttpRequest,
  createFunctionApp,
  mockContext,
  mockHeader,
  mockSession,
  mockProperty,
  mockClassProperty,
  restoreAllMocks
} from '../src';
import * as Web from '../../web/src';
import * as Koa from '../../web-koa/src';
import * as faas from '../../faas/src';
import { join } from 'path';
import { existsSync } from 'fs';
import { MidwayContainer, MidwayMockService } from '@midwayjs/core';
import { BootstrapStarter } from '../../../packages-serverless/midway-fc-starter/src';
import { createBootstrap } from '../src/creator';

describe('/test/new.test.ts', () => {
  it('should test create app with framework and with new mode', async () => {
    const app = await createApp<Web.Framework>(join(__dirname, 'fixtures/base-app-egg'), {
      imports: [
        Web
      ]
    });
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app, { cleanLogsDir: true, cleanTempDir: true });
    expect(existsSync(join(__dirname, 'fixtures/base-app-decorator/logs'))).toBeFalsy();
    expect(existsSync(join(__dirname, 'fixtures/base-app-decorator/run'))).toBeFalsy();
  });

  it('should test create koa app with new mode with mock', async () => {
    const app = await createApp<Koa.Framework>(join(__dirname, 'fixtures/base-app-koa'), {
      cleanLogsDir: true,
      globalConfig: {
        keys: '123'
      }
    }, Koa);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');

    mockContext(app, 'abc', 'ddd');
    mockHeader(app, 'x-bbb', 'midway');
    mockSession(app, 'ccc', 'ddd');
    const result1 = await createHttpRequest(app).get('/mock');
    expect(result1.status).toBe(200);
    expect(result1.body).toEqual({
      'abc': 'ddd',
      'header': 'midway',
      'session': 'ddd'
    });

    mockProperty(app, 'ccc', 'bbb');
    expect(app['ccc']).toEqual('bbb');

    class BBB {
      invoke() {
        return 'hello';
      }
    }
    mockClassProperty(BBB, 'invoke', 'midway');
    expect(new BBB().invoke).toEqual('midway');

    restoreAllMocks();
    expect(new BBB().invoke()).toEqual('hello');

    await close(app, { sleep: 200});
  });

  it('should test with createFunctionApp with new mode', async () => {
    const app = await createFunctionApp<faas.Framework>(join(__dirname, 'fixtures/base-faas'), {
      imports: [
        faas
      ],
      starter: new BootstrapStarter(),
    });
    const instance = await app.getServerlessInstance('eventService') as any;
    const result = await instance.handleEvent();

    expect(result).toEqual('hello world');
    await close(app, { cleanLogsDir: true, cleanTempDir: true });
  });

  it('should test createLightApp', async () => {
    const app = await createLightApp(join(__dirname, 'fixtures/base-app-light'));
    expect(app).toBeDefined();
    await close(app);
  });

  it('should test repeat load', async () => {
    const app1 = await createLightApp(join(__dirname, 'fixtures/base-app-replace-load/app1'));
    const homeController1 = await app1.getApplicationContext().getAsync('homeController') as any;
    expect(await homeController1.index()).toEqual('hello world 1111');
    await close(app1);

    const app2 = await createLightApp(join(__dirname, 'fixtures/base-app-replace-load/app2'));
    const homeController2 = await app2.getApplicationContext().getAsync('homeController') as any;
    expect(await homeController2.index()).toEqual('hello world 2222');
    await close(app2);
  });

  it('should test mock without app', async () => {
    class BBB {
      invoke() {
        return 'hello';
      }
    }
    mockClassProperty(BBB, 'invoke', 'midway');

    const b = new BBB();
    mockProperty(b, 'ccc', 'ab');

    const container = new MidwayContainer();
    container.bindClass(MidwayMockService);
    await container.getAsync(MidwayMockService, [container]);
    expect(new BBB().invoke).toEqual('midway');
    expect(b['ccc']).toEqual('ab');
  });

  it('should test with entry file', async () => {
    const bootstrap = await createBootstrap(join(__dirname, 'fixtures/base-app-bootstrap', 'bootstrap.js'), {
      bootstrapMode: 'app',
    });
    const app = bootstrap.getApp('koa');

    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    console.log('start close');
    await bootstrap.close({
      sleep: 2000
    });
    console.log('close complete');
  });

  it('should test entry file with faas v3', async () => {
    const app = await createFunctionApp(join(__dirname, 'fixtures/base-faas-without-yaml'), {
      entryFile: 'index.js'
    });
    const result = await createHttpRequest(app).get('/event').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app);
  });
});
