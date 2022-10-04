import { createKafkaProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';
import { loggers } from '@midwayjs/logger';
import { sleep } from '@midwayjs/core';
loggers.updateConsoleLevel('silly');

describe('/test/index.test.ts', () => {
  it('should test create producer with method', async () => {
    // create a producer
    const producer = await createKafkaProducer({
      kafkaConfig: {
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
      },
      mock: false,
    });
    await producer.connect();
    const app = await creatApp('base-app');
    await sleep(3000);
    await producer.send({
      // compression: CompressionTypes.GZIP,
      topic: 'topic-test',
      messages: [
        { key: 'message-key1', value: 'hello consumer!' },
        { key: 'message-key2', value: 'hello consumer!!' },
      ],
    });
    await sleep(3000);
    await producer.disconnect();
    await closeApp(app);
  });
  // 多个同名主题时的消费情况
  it('should test create producer and consumer with the multi same topic', async () => {
    // create a producer
    const producer = await createKafkaProducer({
      kafkaConfig: {
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
      },
      mock: false,
    });
    await producer.connect();
    const app = await creatApp('base-app-multi-some-topic');
    // 采用fromBeginning为false,使用最新的偏移量的时候，因为分组可能会出现rebalancing, a rejoin is needed需要时间，
    // 生产者需要在消费者后发送消息一段时间后保证可以收取到信息,至于在发布信息在前或者在后都没影响。
    // error: The group is rebalancing, so a rejoin is needed
    await sleep(3000);
    await producer.send({
      // compression: CompressionTypes.GZIP,
      topic: 'topic-test',
      messages: [{ key: 'message-key1', value: 'hello consumer 111 !' }],
    });
    await sleep(3000);
    await producer.disconnect();
    await closeApp(app);
    expect(app.getAttr('total')).toEqual(2);
  });
  // 多个不同主题时的消费情况
  it('should test create producer and consumer with the multi different topic', async () => {
    // create a producer
    const producer = await createKafkaProducer({
      kafkaConfig: {
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
      },
      mock: false,
    });
    await producer.connect();
    const app = await creatApp('base-app-multi-different-topic');
    await sleep(3000);
    // send data to topic
    await producer.send({
      // compression: CompressionTypes.GZIP,
      topic: 'topic-test',
      messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
    });
    await producer.send({
      // compression: CompressionTypes.GZIP,
      topic: 'topic-test2',
      messages: [{ key: 'message-key2', value: 'hello consumer 22 !' }],
    });
    await sleep(3000);
    await producer.disconnect();
    await closeApp(app);
    expect(app.getAttr('total')).toEqual(2);
  });

  it('should test create producer and consumer with auto commit', async () => {
    // create a producer
    const producer = await createKafkaProducer({
      kafkaConfig: {
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
      },
      mock: false,
    });
    await producer.connect();
    const app = await creatApp('base-app-auto-commit');
    await sleep(3000);
    // send data to topic
    await producer.send({
      topic: 'topic-test',
      messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
    });
    await sleep(3000);
    await producer.disconnect();
    await closeApp(app);
    expect(app.getAttr('total')).toEqual(1);
  });
  it('should test create producer and consumer with manual committing', async () => {
    // create a producer
    const producer = await createKafkaProducer({
      kafkaConfig: {
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9092'],
      },
      mock: false,
    });
    await producer.connect();
    let app = await creatApp('base-app-manual-committing');
    await sleep(3000);
    // send data to topic
    await producer.send({
      topic: 'topic-test0',
      messages: [{ key: 'message-key1', value: 'hello consumer 11 !' }],
    });
    await sleep(3000);
    await producer.disconnect();
    await closeApp(app);
    expect([1, 2]).toContain(app.getAttr('total'))
  });
});
