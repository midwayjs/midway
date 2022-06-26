import { join } from 'path';
import * as assert from 'assert';
import { close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '../src';
import { EventService } from './fixtures/faas-v2/src/event';
import { createInitializeContext, createTimerEvent } from '../../serverless-fc-trigger';
import { FC } from '@midwayjs/faas-typings';
import * as fs from 'fs';
import { createFunctionApp } from './util';

describe('test/faas-v2.test.ts', () => {
  let app: Application;
  const appDir = join(__dirname, 'fixtures/faas-v2');
  beforeAll(async () => {
    app = await createFunctionApp<Framework>(appDir, {
      initContext: createInitializeContext() as FC.InitializeContext,
    });
  });
  afterAll(async () => {
    await close(app);
  });
  it('http get',  done => {
    createHttpRequest(app)
      .get('/hello?name=test&age=123')
      .expect(200)
      .then(response => {
        assert(response.body.path === '/hello');
        assert(response.body.method === 'GET');
        assert(response.body.headers);
        assert(response.body.query.name === 'test');
        assert(response.body.query.age === '123');
        done();
      })
      .catch(err => done(err));
  });
  it('http get controller',  done => {
    createHttpRequest(app)
      .get('/user')
      .expect(200)
      .then(response => {
        assert(response.text === 'user');
        done();
      })
      .catch(err => done(err));
  });
  it('http get controller params',  done => {
    createHttpRequest(app)
      .get('/user/midway')
      .expect(200)
      .then(response => {
        assert(response.text === 'midway');
        done();
      })
      .catch(err => done(err));
  });
  it('http post',  done => {
    createHttpRequest(app)
      .post('/hello')
      .type('form')
      .send({ id: '1' })
      .expect(200)
      .then(response => {
        assert(response.body.path === '/hello');
        assert(response.body.method === 'POST');
        assert(
          /x-www-form-urlencoded/.test(response.body.headers['content-type'])
        );
        assert(response.body.body.id === '1');
        done();
      })
      .catch(err => done(err));
  });

  it.skip('http post upload', done => {
    const imagePath = join(appDir, '1.jpg');
    createHttpRequest(app)
      .post('/upload')
      .field('name', 'form')
      .attach('file', imagePath)
      .expect(200)
      .then(async response => {
        assert(response.body.files.length === 1);
        assert(response.body.files[0].filename === '1.jpg');
        assert(response.body.fields.name === 'form');
        done();
      })
      .catch(err => done(err));
  });

  it('oth event trigger', async () => {
    const instance = await app.getServerlessInstance<EventService>(EventService);

    try {
      const result = await instance.handler(createTimerEvent());
      console.log(result);
      // expect(result.triggerName).toEqual('timer');
    } catch (e) {
      console.log(e);
    }
  });

  it('should use @ServerlessTrigger with http event', async () => {
    const result = await createHttpRequest(app)
      .get('/func/http/get')
      .query({
        name: 'zhangting'
      });
    expect(result.text).toEqual('user:zhangting');
  });

  it('should use @ServerlessTrigger with http post event', async () => {
    const result = await createHttpRequest(app)
      .post('/func/http/post')
      .send({
        name: 'zhangting'
      });
    expect(result.text).toEqual('user:zhangting');
  });

  it('test serverless logger should not write log to file', function () {
    expect(fs.existsSync(join(appDir, 'logs'))).toBeFalsy();
  });
});
