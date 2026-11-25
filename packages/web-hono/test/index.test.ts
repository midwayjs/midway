import { createLegacyApp, createHttpRequest, close } from '@midwayjs/mock';
import { Configuration, Framework, IMidwayHonoApplication } from '../src';
import * as defaultConfig from '../src/config/config.default';

describe('hono component', () => {
  let app: IMidwayHonoApplication;
  let server;

  beforeAll(async () => {
    app = await createLegacyApp('base-app');
    server = (app as any).getFramework().getServer();
  });

  afterAll(async () => {
    await close(app as any);
  });

  it('should export framework and configuration class', () => {
    expect(Framework).toBeDefined();
    expect(Configuration).toBeDefined();
  });

  it('should expose default hono config', () => {
    expect(defaultConfig.hono).toEqual({});
  });

  it('should support query parameter decorator', async () => {
    const result = await createHttpRequest(server)
      .get('/api/hello')
      .query({ name: 'midway' });

    expect(result.status).toBe(200);
    expect(result.text).toBe('hello midway');
  });

  it('should support body and headers decorators', async () => {
    const result = await createHttpRequest(server)
      .post('/api/echo')
      .set('x-id', 'test-id')
      .send({ name: 'jack' });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      name: 'jack',
      id: 'test-id',
    });
  });

  it('should support response decorators', async () => {
    const statusResult = await createHttpRequest(server).get('/api/status');
    expect(statusResult.status).toBe(201);
    expect(statusResult.text).toBe('created');

    const headerResult = await createHttpRequest(server).get('/api/set-header');
    expect(headerResult.status).toBe(200);
    expect(headerResult.headers['x-powered-by']).toBe('midway-hono');
  });

  it('should set 204 when return value is undefined', async () => {
    const result = await createHttpRequest(server).get('/api/empty');
    expect(result.status).toBe(204);
  });

  it('should run middleware in fixture app', async () => {
    const result = await createHttpRequest(server).get('/api/hello').query({
      name: 'middleware',
    });
    expect(result.status).toBe(200);
    expect(result.headers['x-from-middleware']).toBe('true');
  });
});
