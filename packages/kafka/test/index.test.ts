import { createKafkaProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';
import { loggers } from '@midwayjs/logger';
import { sleep } from '@midwayjs/decorator';

loggers.updateConsoleLevel('silly');

describe('/test/index.test.ts', () => {
  it('should test create producer with method', async () => {
    // create a producer
    const producer = await createKafkaProducer({
      kafkaConfig: {
        clientId: 'my-app',
        brokers: [process.env.KAFKA_BROKERS as string || 'localhost:9093'],
      },
      mock: false,
    });
    await producer.connect()
    // send data to topic
    await producer.send({
      // compression: CompressionTypes.GZIP,
      topic: 'topic-test',
      messages: [{ key: 'message-key1', value: 'hello consumer!' }, { key: 'message-key2', value: 'hello consumer!!' }],
    });
    // create app and got data
    const app = await creatApp('base-app')
    // will be close app wait a moment(after commit)
    await sleep(1000)
    await producer.disconnect();
    await closeApp(app);
  });
});
