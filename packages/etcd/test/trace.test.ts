import { ETCDServiceFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for etcd request', async () => {
    const factory = new ETCDServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const pool: any = {
      exec: jest.fn(async (_serviceName: string, method: string) => method),
    };
    const client: any = { pool };

    (factory as any).bindTraceContext(client);
    const result = await pool.exec('KV', 'put', {});

    expect(result).toBe('put');
    expect(runWithExitSpan).toHaveBeenCalled();
  });
});
