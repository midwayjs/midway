import { close, createApp, createHttpRequest, createLightApp } from '@midwayjs/mock';
import { InfoService } from '../src';
import { join } from 'path';
import * as info from '../src';

describe('test/index.test.ts', () => {
  it('info service', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/app'));
    const infoService = await app.getApplicationContext().getAsync(InfoService);
    expect(infoService).toBeDefined();
    const info = infoService.info();
    expect(Object.keys(info).length > 5).toBeTruthy();

    const html = infoService.info('html');
    expect(html).toMatch('Midway Info');
    await close(app);
  });

  it('test koa middleware', async () => {
    const app = await createApp(join(__dirname, './fixtures/web-koa'));
    const result = await createHttpRequest(app).get('/_test_route');
    expect(result.type).toEqual('text/html');
    expect(result.text).toMatch('xxx');
    await close(app);
  });

  it('test express middleware', async () => {
    const app = await createApp(join(__dirname, './fixtures/web-express'));
    const result = await createHttpRequest(app).get('/_info');
    expect(result.type).toEqual('text/html');
    expect(result.text).toMatch('Midway Info');
    await close(app);
  });

  it('should test get config and filter secret', async () => {
    const app = await createLightApp('', {
      globalConfig: {
        keys: ['123445555'],
        oss: {
          clients: {
            default: {
              accessKeyId: '123',
              accessKeySecret: 'fjdlsaf',
            }
          }
        },
        cos: {
          default: {
            SecretId: 'dfdsafdsaf',
            SecretKey: 'tewqtewqvc',
            SecurityToken: 'fjkdlsajfdsaf'
          }
        }
      },
      imports: [
        info
      ]
    });
    const infoService = await app.getApplicationContext().getAsync(InfoService);
    const config = infoService.midwayConfig();
    delete config['info']['midwayLogger'];
    expect(config).toMatchSnapshot();
  });
});
