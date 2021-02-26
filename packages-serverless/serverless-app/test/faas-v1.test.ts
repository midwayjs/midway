'use strict';
import { join } from 'path';
import * as assert from 'assert';
import { createApp, close } from '@midwayjs/mock';
const request = require('supertest');
const cwd = join(__dirname, 'fixtures/faas-v1');
describe('test/faas-v1.test.ts', () => {
  let app;
  beforeAll(async () => {
    process.env.DEV_MIDWAY_FAAS_VERSION = '1';
    process.env.DEV_MIDWAY_FAAS_MODULE = '@midwayjs/test-faas-version-1';
    app = await createApp(cwd, {}, join(__dirname, '../src'));
    process.env.DEV_MIDWAY_FAAS_VERSION = '';
    process.env.DEV_MIDWAY_FAAS_MODULE = '';
  });
  afterAll(async () => {
    await close(app);
  });
  it('http get', async done => {
    request(app)
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
  it('http post', async done => {
    await request(app)
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
    await request(app)
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
});
