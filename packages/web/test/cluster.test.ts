import { mm } from '@midwayjs/mock';
import * as path from 'path';
import * as assert from 'assert';

describe('/test/cluster.ts', () => {

  describe('load ts file', () => {
    let app;
    beforeAll(async () => {
      app = mm.app({
        baseDir: path.join(__dirname, 'fixtures/feature/base-app-dist'),
        framework: path.join(__dirname, '../'),
        typescript: true,
      });

      await app.ready();
    });

    it('mock context', async () => {
      const ctx = app.mockContext();
      const userService = await ctx.requestContext.getAsync('userService');
      assert((await userService.hello()) === 'world,0');
    });

    it('should load ts directory', done => {
      return app.httpRequest()
        .get('/api')
        .expect(200)
        .expect('hello', done);
    });
  });

});
