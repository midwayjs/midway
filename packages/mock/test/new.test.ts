import { close, createApp, createLightApp, /*createBootstrap, */ createHttpRequest, /*createFunctionApp*/ } from '../src';
import { Framework } from '../../web/src';
import { Framework as KoaFramework } from '../../web-koa/src';
// import { Framework as ServerlessFramework } from '../../../packages-serverless/serverless-app/src';
import { join } from 'path';
// import { MidwayFrameworkType } from '@midwayjs/decorator';
import { existsSync } from 'fs';
// import { EventService } from './fixtures/base-faas/src/event';

describe('/test/new.test.ts', () => {
  it('should test create app', async () => {
    const app = await createApp<Framework>(join(__dirname, 'fixtures/base-app-decorator'), {}, Framework);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app, { cleanLogsDir: true, cleanTempDir: true });
    expect(existsSync(join(__dirname, 'fixtures/base-app-decorator/logs'))).toBeFalsy();
    expect(existsSync(join(__dirname, 'fixtures/base-app-decorator/run'))).toBeFalsy();
  });

  it('should test create another app', async () => {
    const app = await createApp<KoaFramework>(join(__dirname, 'fixtures/base-app-new'), { cleanLogsDir: true }, KoaFramework);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app, { sleep: 200});
  });

  // it('should test with entry file', async () => {
  //   const bootstrap = await createBootstrap(join(__dirname, 'fixtures/base-app-bootstrap', 'bootstrap.js'));
  //   const app = bootstrap.getApp(MidwayFrameworkType.WEB_KOA);
  //
  //   const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
  //   expect(result.status).toBe(200);
  //   expect(result.text).toBe('hello world, harry');
  //   await bootstrap.close();
  // });

  // it('should test with createFunctionApp', async () => {
  //   const app = await createFunctionApp<ServerlessFramework>(join(__dirname, 'fixtures/base-faas'), {}, ServerlessFramework);
  //   const instance: EventService = await app.getServerlessInstance(EventService);
  //   const result = await instance.handleEvent();
  //
  //   expect(result).toEqual('hello world');
  //   await close(app, { cleanLogsDir: true, cleanTempDir: true });
  // });

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
    const homeController2 = await app1.getApplicationContext().getAsync('homeController') as any;
    expect(await homeController2.index()).toEqual('hello world 2222');
    await close(app2);
  });
});
