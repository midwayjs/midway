import { TableStoreServiceFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for tablestore request', async () => {
    const factory = new TableStoreServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const client: any = {
      makeRequest: jest.fn(async (operation: string) => operation),
    };

    (factory as any).bindTraceContext(client);
    const result = await client.makeRequest('GetRow', {});

    expect(result).toBe('GetRow');
    expect(runWithExitSpan).toHaveBeenCalled();
  });
});
