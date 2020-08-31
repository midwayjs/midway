const request = require('supertest');
import { clearAllModule } from '@midwayjs/decorator';

const utils = require('./utils');
const pedding = require('pedding');

describe('/test/issue.test.ts', () => {
  afterEach(clearAllModule);

  describe('test #264 issue to fix ctx bind', () => {
    let app;
    beforeAll(() => {
      app = utils.app('issue/base-app-lazyload-ctx', {
        typescript: true,
      });
      return app.ready();
    });

    afterAll(() => app.close());

    it('should get right ctx path', done => {
      done = pedding(4, done);

      request(app.callback())
        .get('/api/code/list')
        .expect(200)
        .expect(
          'Code: /api/code/list, User: /api/code/list, Hello Result',
          done
        );

      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('User: /api/user/info, Hello Result', done);

      request(app.callback())
        .get('/api/code/list')
        .expect(200)
        .expect(
          'Code: /api/code/list, User: /api/code/list, Hello Result',
          done
        );

      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('User: /api/user/info, Hello Result', done);
    });
  });

  describe('test #215 issue to fix egg extension', () => {
    let app;
    beforeAll(() => {
      app = utils.app('issue/base-app-extend-context', {
        typescript: true,
      });
      return app.ready();
    });

    afterAll(() => app.close());

    it('Correctly reference the egg extension implementation', done => {
      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('hello world', done);
    });
  });
});
