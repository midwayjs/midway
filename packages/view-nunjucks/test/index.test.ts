import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa'
import { join } from 'path';

describe('/test/index.test.ts', () => {

  let app;

  beforeAll(async () => {
    app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, Framework);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should render string', async () => {
    const result = await createHttpRequest(app).get('/string');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hi, egg');
  });

  it('should render string with options path', async () => {
    const result = await createHttpRequest(app).get('/string_options');
    expect(result.status).toEqual(200);
    expect(result.text).toContain('<div>egg<div>');
  });

  it('should render template', async () => {
    const result = await createHttpRequest(app).get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toContain('hi, egg');
  });

  it('should render template not found', (done) => {
    createHttpRequest(app)
      .get('/not_found')
      .expect(500)
      .expect(/Can\'t find not_found.tpl from /,  done);
  });

  it('should render error', (done) => {
    createHttpRequest(app)
      .get('/error_string')
      .expect(500)
      .expect(/Template render error/i,  done);
  });

  it('should inject helper/ctx/request', (done) => {
    createHttpRequest(app)
      .get('/inject')
      .expect(200)
      .expect(/ctx: true/)
      .expect(/request: true/, done)
      // .expect(/helper: true/)
      // .expect(/helperFn: true/,  done);
  });

  it('should load filter.js', (done) => {
    createHttpRequest(app)
      .get('/filter')
      .expect(200)
      .expect(/hi, egg/,  done);
  });

  it('should load filter.js with include', (done) => {
    createHttpRequest(app)
      .get('/filter/include')
      .expect(200)
      .expect(/hi, egg/)
      .expect(/hi, yadan/,  done);
  });

  it('should extend locals', (done) => {
    createHttpRequest(app)
      .get('/locals')
      .expect(200)
      .expect(/app, ctx, locals/,  done);
  });
});
