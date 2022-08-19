import { join } from 'path';
import { RedisService, RedisServiceFactory } from '../src';
import { close, createLightApp } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {

  it('test single client', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-single-client'));
    const redisService = await app.getApplicationContext().getAsync(RedisService);
    // test event
    redisService.on('connect', () => {
      console.log('redis connect');
    });
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

  it('support custom command defination', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app-single-client'));
    const redisService = await app.getApplicationContext().getAsync(RedisService);
    redisService.defineCommand('myecho', {
      numberOfKeys: 2,
      lua: 'return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}',
    });
    // @ts-ignore
    const result = await redisService.myecho('k1', 'k2', 'a1', 'a2');
    expect(result).toEqual(['k1', 'k2', 'a1', 'a2']);
    await close(app);
  });

  it('should fail when unable to connect redis', async () => {
    await expect(createLightApp(join(__dirname, './fixtures/base-app-bad-client')))
      .rejects
      .toThrow('connect ETIMEDOUT');
  });

  it('should throw error when instance not found', async () => {
    await expect(async () => {
      const service = new RedisService();
      (service as any).serviceFactory = new Map();
      await service.init();
    }).rejects.toThrowError(/instance not found/);
  });
});
