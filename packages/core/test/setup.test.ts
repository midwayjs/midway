import { join } from 'path';
import { initializeGlobalApplicationContext, MidwayConfigService } from '../src';

describe('/test/setup.test.ts', () => {
  it('should test ConfigFramework', async () => {

    const container = await initializeGlobalApplicationContext({
      baseDir: join(
        __dirname,
        './fixtures/base-app-config/src'
      )
    });

    const configService = await container.getAsync(MidwayConfigService);
    expect(configService.getConfiguration()).toEqual({
      "hello": {
        "a": 1,
        "b": 4,
        "c": 3,
        "d": [
          1,
          2,
          3
        ]
      },
      "keys": "key",
      "plugins": {
        "bucLogin": false
      }
    });
  });
});
