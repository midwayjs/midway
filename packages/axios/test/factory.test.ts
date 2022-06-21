import { join } from 'path';
import { HttpServiceFactory, HttpService } from '../src';
import { createLightApp } from '@midwayjs/mock';

describe('/test/factory.test.ts', () => {

  it('should test with factory', async () => {
    const app = await createLightApp('', {
      imports: [
        require(join(__dirname, '../src'))
      ],
      globalConfig: {
        axios: {
          clients: {
            default: {},
            httpService2: {}
          }
        }
      }
    });
    const httpService = await app.getApplicationContext().getAsync(HttpService);

    expect(httpService).toBeDefined();
    const httpServiceFactory = await app.getApplicationContext().getAsync(HttpServiceFactory);
    const httpService2 = httpServiceFactory.get('httpService2');
    expect(httpService).not.toEqual(httpService2);
  });
});
