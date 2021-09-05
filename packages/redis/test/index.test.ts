import { join } from 'path';
import { RedisService, RedisServiceFactory } from '../src';
import { close, createLightApp } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {

  it('test single client', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-single-client'));
    const redisService = await app.getApplicationContext().getAsync(RedisService);
    await redisService.set('foo', 'bar');
    const result = await redisService.get('foo');
    expect(result).toEqual('bar');
    await close(app);
  });

  it('should single client supportTimeCommand = false', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-supportTimeCommand-false'));
    const redisService = await app.getApplicationContext().getAsync(RedisService);
    await redisService.set('foo', 'bar');
    const result = await redisService.get('foo');
    expect(result).toEqual('bar');
    await close(app);
  });

  it('should multi client', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-multi-client'));
    const redisServiceFactory = await app.getApplicationContext().getAsync(RedisServiceFactory);
    const redis = await redisServiceFactory.get('cache');
    await redis.set('foo', 'bar');
    const result = await redis.get('foo');
    expect(result).toEqual('bar');
    await close(app);
  });

  it.skip('should sentinel', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-sentinel'));
    const redisService = await app.getApplicationContext().getAsync(RedisService);
    await redisService.set('foo', 'bar');
    const result = await redisService.get('foo');
    expect(result).toEqual('bar');
    await close(app);
  });

});
