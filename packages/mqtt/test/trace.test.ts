import { MqttProducerFactory } from '../src';

describe('/test/trace.test.ts', () => {
  it('should inject context for mqtt publish', async () => {
    const factory = new MqttProducerFactory();
    const injectContext = jest.fn((carrier: any) => {
      carrier.traceparent = '00-test';
    });
    (factory as any).traceService = {
      injectContext,
    };

    const client: any = {
      publish: jest.fn((_topic, _message, options) => options),
      publishAsync: jest.fn(async (_topic, _message, options) => options),
    };

    (factory as any).bindTraceContext(client);
    const publishOptions = client.publish('topic', 'hello', {});
    const publishAsyncOptions = await client.publishAsync('topic', 'hello', {});

    expect(injectContext).toHaveBeenCalledTimes(2);
    expect(publishOptions.properties.userProperties.traceparent).toBe('00-test');
    expect(publishAsyncOptions.properties.userProperties.traceparent).toBe(
      '00-test'
    );
  });
});
