import { join } from 'path';
import { ConfigFramework } from '../src';

describe('/test/emptyFramework.test.ts', () => {
  it('should test ConfigFramework', async () => {
    const framework = new ConfigFramework();
    await framework.initialize({
      baseDir: join(
        __dirname,
        './fixtures/base-app-config/src'
      ),
    });

    expect(framework.getConfiguration()).toEqual({
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
