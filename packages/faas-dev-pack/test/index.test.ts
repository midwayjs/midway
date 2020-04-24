import * as koa from 'koa';
import * as express from 'express';
import { useExpressDevPack, useKoaDevPack } from '../src';
import { join } from 'path';
import * as request from 'supertest';
import * as assert from 'assert';
import { remove, pathExists } from 'fs-extra';

describe('/test/index.test.ts', () => {
  beforeEach(async () => {
    const dirs = [join(__dirname, './fixtures/ice-demo-repo')];
    for (const dir of dirs) {
      if (await pathExists(join(dir, '.faas_debug_tmp'))) {
        await remove(join(dir, '.faas_debug_tmp'));
      }
    }
  });
  it('should invoke by http api and koa', (done) => {
    const app = new koa();
    app.use(
      useKoaDevPack({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
    );
    request(app.callback())
      .post('/server/user/info')
      .query({
        action: 'doTest',
      })
      .send({ name: 'zhangting' })
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect(/zhangting,hello http world,doTest/)
      .expect('x-schema', 'bbb')
      .expect(200, done);
  });

  it('should invoke by http router /api/*', (done) => {
    const app = new koa();
    app.use(
      useKoaDevPack({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
    );
    request(app.callback()).get('/api/test2').expect(/test2/).expect(200, done);
  });

  it('should invoke by http api and express', (done) => {
    const app = express();
    app.use(
      useExpressDevPack({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
    );
    request(app)
      .post('/server/user/info')
      .query({
        action: 'doTest',
      })
      .send({ name: 'zhangting' })
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect(/zhangting,hello http world,doTest/)
      .expect('x-schema', 'bbb')
      .expect(200, done);
  });

  it('should invoke by http api parallel', (done) => {
    const app = express();
    app.use(
      useExpressDevPack({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
    );
    Promise.all([
      request(app)
        .post('/server/user/info')
        .query({
          action: 'doTest',
        })
        .send({ name: 'one' })
        .expect('Content-type', 'text/html; charset=utf-8')
        .expect(200)
        .then((response) => {
          return response.text;
        }),
      request(app)
        .post('/server/user/info')
        .query({
          action: 'doTest',
        })
        .send({ name: 'two' })
        .expect('Content-type', 'text/html; charset=utf-8')
        .expect(200)
        .then((response) => {
          return response.text;
        }),
    ])
      .then((res) => {
        assert.deepEqual(res, [
          'one,hello http world,doTest',
          'two,hello http world,doTest',
        ]);
        done();
      })
      .catch(done);
  });

  describe('test buffer return', () => {

    it('test buffer result koa in http trigger', (done) => {
      const app = new koa();
      app.use(
        useKoaDevPack({
          functionDir: join(__dirname, './fixtures/base-fn-http'),
        })
      );
      request(app.callback())
        .get('/api')
        .expect('Content-type', 'text/plain; charset=utf-8')
        .expect(/hello world/)
        .expect(200, done);
    });

    it('test buffer result koa in apigw trigger', (done) => {
      const app = new koa();
      app.use(
        useKoaDevPack({
          functionDir: join(__dirname, './fixtures/base-fn-apigw'),
        })
      );
      request(app.callback())
        .get('/api')
        .expect('Content-type', 'text/plain; charset=utf-8')
        .expect(/hello world/)
        .expect(200, done);
    });

    it('test buffer result express in http trigger', (done) => {
      const app = express();
      app.use(
        useExpressDevPack({
          functionDir: join(__dirname, './fixtures/base-fn-http'),
          sourceDir: 'src/apis',
        })
      );
      request(app)
        .get('/api')
        .expect('Content-type', 'text/plain; charset=utf-8')
        .expect(/hello world/)
        .expect(200, done);
    });

    it('test buffer result express in apigw trigger', (done) => {
      const app = express();
      app.use(
        useExpressDevPack({
          functionDir: join(__dirname, './fixtures/base-fn-apigw'),
          sourceDir: 'src/apis',
        })
      );
      request(app)
        .get('/api')
        .expect('Content-type', 'text/plain; charset=utf-8')
        .expect(/hello world/)
        .expect(200, done);
    });

  });

});
