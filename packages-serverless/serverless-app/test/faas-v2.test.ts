'use strict';
import { join } from 'path';
import * as assert from 'assert';
import { createApp, close } from '../../../packages/mock';
import { Framework, IServerlessApp } from '../src';
import { EventService } from './fixtures/faas-v2/src/event';
const request = require('supertest');
const cwd = join(__dirname, 'fixtures/faas-v2');
describe('test/faas-v2.test.ts', () => {

  if (/^v10/.test(process.version)) {
    it('skip node v10', () => {});
    return;
  }

  let app: IServerlessApp;
  beforeAll(async () => {
    app = await createApp<Framework>(cwd, {}, join(__dirname, '../src'));
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
  it('oth event trigger', async () => {
    const instance = await app.getServerlessInstance<EventService>(EventService);
    const result = instance.handler({ name: 123 });
    assert(result.name === 123);
  });
});
