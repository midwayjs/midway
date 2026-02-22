import { KafkaProducerFactory } from '../src/service';

describe('/test/trace.test.ts', () => {
  it('should inject context for kafka producer messages', async () => {
    const factory = new KafkaProducerFactory();
    const injectContext = jest.fn((carrier: any) => {
      carrier.traceparent = '00-test';
    });
    (factory as any).traceService = {
      injectContext,
    };

    const producer: any = {
      send: jest.fn(async payload => payload),
      sendBatch: jest.fn(async payload => payload),
    };

    (factory as any).bindTraceContext(producer);
    const sendPayload = await producer.send({
      topic: 'topic-a',
      messages: [{ value: 'hello' }],
    });
    const batchPayload = await producer.sendBatch({
      topicMessages: [
        {
          topic: 'topic-a',
          messages: [{ value: 'hello-batch' }],
        },
      ],
    });

    expect(injectContext).toHaveBeenCalledTimes(2);
    expect(sendPayload.messages[0].headers.traceparent).toBe('00-test');
    expect(
      batchPayload.topicMessages[0].messages[0].headers.traceparent
    ).toBe('00-test');
  });
});
