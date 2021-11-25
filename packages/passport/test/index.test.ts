import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework as ExpressFramework } from '@midwayjs/express';
import { Framework as KoaFramework } from '@midwayjs/koa';
import { Framework as EggFramework } from '@midwayjs/web';
import { join } from 'path';

describe('Express passport', () => {
  let app = null;

  beforeAll(async () => {
    process.env['MIDWAY_PASSPORT_MODE'] = 'express'
    try {
      app = await createApp(
        join(__dirname, 'fixtures', 'passport-express'),
        {},
        ExpressFramework
      );
    } catch (e) {
      console.error(e);
    }
  });

  afterAll(async () => {
    process.env['MIDWAY_PASSPORT_MODE'] = undefined;
    await close(app);
  });

  it('basic local auth', async () => {
    let result = await createHttpRequest(app)
      .get('/local-passport')
      .query({ username: 'admin', password: '123' });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });

  it('BootStrategy useParams', async () => {
    let result = await createHttpRequest(app)
      .get('/local-passport2')
      .query({ username: 'admin', pwd: '123' });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });
});

describe('Koa passport', () => {
  let app = null;

  beforeAll(async () => {
    app = await createApp(
      join(__dirname, 'fixtures', 'passport-web'),
      {},
      KoaFramework
    );
  });

  afterAll(async () => {
    await close(app);
  });

  it('basic local passport inspect', async () => {
    let result = await createHttpRequest(app)
      .get('/local-passport')
      .query({ username: 'admin', password: '123' });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });

  it('BootStrategy useParams', async () => {
    let result = await createHttpRequest(app)
      .get('/local-passport2')
      .query({ username: 'admin', pwd: '123' });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });
});

describe('Egg passport', () => {
  let app = null;

  beforeAll(async () => {
    app = await createApp(
      join(__dirname, 'fixtures', 'passport-web'),
      {},
      EggFramework
    );
  });

  afterAll(async () => {
    await close(app);
  });

  it('basic local auth', async () => {
    let result = await createHttpRequest(app)
      .get('/local-passport')
      .query({ username: 'admin', password: '123' });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });

  it('BootStrategy useParams', async () => {
    let result = await createHttpRequest(app)
      .get('/local-passport2')
      .query({ username: 'admin', pwd: '123' });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });
});
