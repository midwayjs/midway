import { close, createApp, createLightApp, createHttpRequest, createFunctionApp } from '../src';
import * as Web from '../../web/src';
import * as Koa from '../../web-koa/src';
import * as ServerlessApp from '../../../packages-serverless/serverless-app/src';
import { join } from 'path';
import { existsSync } from 'fs';
import { EventService } from './fixtures/base-faas/src/event';

describe('/test/new.test.ts', () => {
  it('should test create app', async () => {
    const app = await createApp<Web.Framework>(join(__dirname, 'fixtures/base-app-decorator'), {}, Web);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app, { cleanLogsDir: true, cleanTempDir: true });
    expect(existsSync(join(__dirname, 'fixtures/base-app-decorator/logs'))).toBeFalsy();
    expect(existsSync(join(__dirname, 'fixtures/base-app-decorator/run'))).toBeFalsy();
  });

  it('should test create another app', async () => {
    const app = await createApp<Koa.Framework>(join(__dirname, 'fixtures/base-app-new'), {
      cleanLogsDir: true,
      globalConfig: {
        keys: '123'
      }
    }, Koa);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app, { sleep: 200});
  });

  it('should test with createFunctionApp', async () => {
    const app = await createFunctionApp<ServerlessApp.Framework>(join(__dirname, 'fixtures/base-faas'), {}, ServerlessApp);
    const instance: EventService = await app.getServerlessInstance(EventService);
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
});
