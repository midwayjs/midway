import { createLegacyApp, createHttpRequest, close } from '@midwayjs/mock';
import { Configuration, Framework, IMidwayHonoApplication } from '../src';
import * as defaultConfig from '../src/config/config.default';

describe('hono component', () => {
  let app: IMidwayHonoApplication;

  beforeAll(async () => {
    app = await createLegacyApp('base-app');
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
    const result = await createHttpRequest(
      (app as any).getFramework().getServer()
    )
      .get('/api/hello')
      .query({ name: 'midway' });

    expect(result.status).toBe(200);
    expect(result.text).toBe('hello midway');
  });
});
