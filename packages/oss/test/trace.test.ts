import { OSSServiceFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for oss request', async () => {
    const factory = new OSSServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const client: any = {
      request: jest.fn(async request => request.method),
    };

    (factory as any).bindTraceContext(client);
    const result = await client.request({
      method: 'PUT',
    });

    expect(result).toBe('PUT');
    expect(runWithExitSpan).toHaveBeenCalled();
  });
});
