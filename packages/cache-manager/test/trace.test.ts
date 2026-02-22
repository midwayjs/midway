import { CachingFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for cache operations', async () => {
    const factory = new CachingFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const cache: any = {
      async get(key: string) {
        return key;
      },
    };

    (factory as any).bindTraceContext(cache, 'default');
    const result = await cache.get('k1');

    expect(result).toBe('k1');
    expect(runWithExitSpan).toHaveBeenCalled();
  });
});
