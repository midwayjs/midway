import { RabbitMQServer } from '../src/mq';

describe('/test/trace.test.ts', () => {
  it('should inject context for rabbitmq publish options', () => {
    const injectContext = jest.fn((carrier: any) => {
      carrier.traceparent = '00-test';
    });
    const app = new RabbitMQServer({
      logger: {
        error() {},
      },
      traceService: {
        injectContext,
      },
    });

    const channel: any = {
      sendToQueue: jest.fn((_queue, _content, options) => options),
      publish: jest.fn((_exchange, _routingKey, _content, options) => options),
    };

    (app as any).bindTraceContext(channel);
    const sendOptions = channel.sendToQueue('tasks', Buffer.from('data'), {});
    const publishOptions = channel.publish(
      'exchange',
      'key',
      Buffer.from('data'),
      {}
    );

    expect(injectContext).toHaveBeenCalledTimes(2);
    expect(sendOptions.headers.traceparent).toBe('00-test');
    expect(publishOptions.headers.traceparent).toBe('00-test');
  });
});
