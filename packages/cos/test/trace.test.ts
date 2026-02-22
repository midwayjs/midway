import { COSServiceFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for cos request', async () => {
    const factory = new COSServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const client: any = {
      request: jest.fn(async params => params.Action),
    };

    (factory as any).bindTraceContext(client);
    const result = await client.request({
      Action: 'GetObject',
    });

    expect(result).toBe('GetObject');
    expect(runWithExitSpan).toHaveBeenCalled();
  });
});
