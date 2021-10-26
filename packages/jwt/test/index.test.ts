import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework as ExpressFramework } from '@midwayjs/express';
import { Framework as KoaFramework } from '@midwayjs/koa';
import { Framework as EggFramework } from '@midwayjs/web';
import { join } from 'path';

describe('Express jwt', () => {
  let app = null;
  let token;

  beforeAll(async () => {
    app = await createApp(
      join(__dirname, 'fixtures', 'passport-express'),
      {},
      ExpressFramework
    );
  });

  afterAll(async () => {
    await close(app);
    token = null;
  });

  it('generate token', async () => {
    let result = await createHttpRequest(app).get('/gen-jwt');
    token = result.text;
    expect(result.status).toEqual(200);
    expect(typeof result.text).toEqual('string');
  });

  it('Bearer token inspect', async () => {
    let result = await createHttpRequest(app)
      .get('/jwt-passport')
      .set({ Authorization: `Bearer ${token}` });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });
});

describe('Koa jwt', () => {
  let app = null;
  let token;

  beforeAll(async () => {
    app = await createApp(
      join(__dirname, 'fixtures', 'passport-web'),
      {},
      KoaFramework
    );
  });

  afterAll(async () => {
    await close(app);
    token = null;
  });

  it('generate token', async () => {
    let result = await createHttpRequest(app).get('/gen-jwt');
    token = result.text;
    expect(result.status).toEqual(200);
    expect(typeof result.text).toEqual('string');
  });

  it('Bearer token inspect', async () => {
    let result = await createHttpRequest(app)
      .get('/jwt-passport')
      .set({ Authorization: `Bearer ${token}` });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });
});

describe('Egg jwt', () => {
  let app = null;
  let token;

  beforeAll(async () => {
    app = await createApp(
      join(__dirname, 'fixtures', 'passport-web'),
      {},
      EggFramework
    );
  });

  afterAll(async () => {
    await close(app);
    token = null;
  });

  it('generate token', async () => {
    let result = await createHttpRequest(app).get('/gen-jwt');
    token = result.text;
    expect(result.status).toEqual(200);
    expect(typeof result.text).toEqual('string');
  });

  it('Bearer token inspect', async () => {
    let result = await createHttpRequest(app)
      .get('/jwt-passport')
      .set({ Authorization: `Bearer ${token}` });

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('success');
  });
});
