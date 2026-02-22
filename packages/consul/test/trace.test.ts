import { ConsulServiceFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for non-watch consul request', async () => {
    const factory = new ConsulServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const client: any = {
      request: jest.fn(async options => options.method),
    };

    (factory as any).bindTraceContext(client, 'default');
    const result = await client.request({
      method: 'GET',
    });

    expect(result).toBe('GET');
    expect(runWithExitSpan).toHaveBeenCalled();
  });

  it('should bypass tracing for consul watch request', async () => {
    const factory = new ConsulServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const rawRequest = jest.fn(async () => true);
    const client: any = { request: rawRequest };
    (factory as any).bindTraceContext(client, 'default');

    await client.request({
      method: 'GET',
      watch: true,
    });

    expect(rawRequest).toHaveBeenCalled();
    expect(runWithExitSpan).not.toHaveBeenCalled();
  });
});
