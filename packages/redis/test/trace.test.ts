import { RedisServiceFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should create exit span for redis command', async () => {
    const factory = new RedisServiceFactory();
    const runWithExitSpan = jest.fn(async (_name, _options, callback) => {
      return callback();
    });
    (factory as any).traceService = {
      runWithExitSpan,
    };

    const client: any = {
      sendCommand: jest.fn(async command => command.name),
    };

    (factory as any).bindTraceContext(client, 'default');
    const result = await client.sendCommand({ name: 'GET' });

    expect(result).toBe('GET');
    expect(runWithExitSpan).toHaveBeenCalled();
  });
});
