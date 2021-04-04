'use strict';
import { join } from 'path';
import * as assert from 'assert';
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '../src';
import { EventService } from './fixtures/faas-v2/src/event';
import { createInitializeContext, createTimerEvent } from '../../serverless-fc-trigger';
import { FC } from '@midwayjs/faas-typings';

const cwd = join(__dirname, 'fixtures/faas-v2');
describe('test/faas-v2.test.ts', () => {

  if (/^v10/.test(process.version)) {
    it('skip node v10', () => {});
    return;
  }

  let app: Application;
  beforeAll(async () => {
    app = await createApp<Framework>(cwd, {
      initContext: createInitializeContext() as FC.InitializeContext,
    }, join(__dirname, '../src'));
  });
  afterAll(async () => {
    await close(app);
  });
  it('http get', async done => {
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
  it('http get controller', async done => {
    createHttpRequest(app)
      .get('/user')
      .expect(200)
      .then(response => {
        assert(response.text === 'user');
        done();
      })
      .catch(err => done(err));
  });
  it('http get controller params', async done => {
    createHttpRequest(app)
      .get('/user/midway')
      .expect(200)
      .then(response => {
        assert(response.text === 'midway');
        done();
      })
      .catch(err => done(err));
  });
  it('http post', async done => {
    await createHttpRequest(app)
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

  it('http post upload', async done => {
    const imagePath = join(cwd, '1.jpg');
    await createHttpRequest(app)
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
    const result = await instance.handler(createTimerEvent());
    expect(result.payload).toEqual('test');
  });

  it('should use @ServerlessTrigger with http event', async () => {
    const result = await createHttpRequest(app)
      .get('/func/http/get')
      .query({
        name: 'zhangting'
      });
    expect(result.text).toEqual('user:zhangting');
  });
});
