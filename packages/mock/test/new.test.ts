import { close, createApp, createBootstrap, createHttpRequest } from '../src';
import { Framework } from '../../web/src';
import { Framework as KoaFramework } from '../../web-koa/src';
import { join } from 'path';
import { MidwayFrameworkType } from '@midwayjs/decorator';

describe('/test/new.test.ts', () => {
  it('should test create app', async () => {
    const app = await createApp<Framework>(join(__dirname, 'fixtures/base-app-decorator'), {}, Framework);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app);
  });

  it('should test create another app', async () => {
    const app = await createApp<KoaFramework>(join(__dirname, 'fixtures/base-app-new'), { cleanLogsDir: true }, KoaFramework);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app);
  });

  it('should test with entry file', async () => {
    const bootstrap = await createBootstrap(join(__dirname, 'fixtures/base-app-bootstrap', 'bootstrap.js'));
    const app = bootstrap.getApp(MidwayFrameworkType.WEB_KOA);

    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await bootstrap.close();
  });
});
