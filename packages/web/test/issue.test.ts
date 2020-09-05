import * as request from 'supertest';
import { creatApp, closeApp } from './utils';

const pedding = require('pedding');

describe('/test/issue.test.ts', () => {

  describe('test #264 issue to fix ctx bind', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('issue/base-app-lazyload-ctx');
    });

    afterAll(async () => {
      await closeApp(app);
    })

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
    beforeAll(async () => {
      app = await creatApp('issue/base-app-extend-context');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('Correctly reference the egg extension implementation', done => {
      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('hello world', done);
    });
  });
});
