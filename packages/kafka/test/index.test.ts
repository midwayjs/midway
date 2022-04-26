import { createKafkaProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';
import { loggers } from '@midwayjs/logger';
import { sleep } from '@midwayjs/decorator';

loggers.updateConsoleLevel('silly');

describe('/test/index.test.ts', () => {
  it('should test create producer with method', async () => {
    // create a queue and channel
    const producer = await createKafkaProducer('tasks', {
      mock: false,
      brokers: process.env.KAFKA_BROKERS || ['localhost:9092'],
    });
    // send data to topic
    await producer.send({
      topic: 'tasks',
      // compression: CompressionTypes.GZIP,
      messages: 'something to do',
    });

    // create app and got data
    const app = await creatApp('base-app');
    // will be close app wait a moment(after ack)
    await sleep();

    await producer.disconncect();
    await closeApp(app);
  });
});
