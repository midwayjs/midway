import { createRabbitMQProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';
import { loggers } from '@midwayjs/logger';
import { sleep } from '@midwayjs/decorator';

describe('/test/legacy.test.ts', () => {
  it('should test create channel with legacy method', async () => {
    loggers.updateConsoleLevel('silly');
    // create a queue and channel
    const channel = await createRabbitMQProducer('tasks', {
      isConfirmChannel: true,
      mock: false,
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
    });
    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'));

    // create app and got data
    const app = await creatApp('base-app-legacy', { url: process.env.RABBITMQ_URL || 'amqp://localhost'});
    // will be close app wait a moment(after ack)
    await sleep();

    await channel.close();
    await closeApp(app);
  });

  it('should test create channel with new method', async () => {
    loggers.updateConsoleLevel('silly');
    // create a queue and channel
    const manager = await createRabbitMQProducer({
      url: process.env.RABBITMQ_URL || 'amqp://localhost'
    });

    const channel = await manager.createConfirmChannel('tasks');
    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'));

    // create app and got data
    const app = await creatApp('base-app', { url: process.env.RABBITMQ_URL || 'amqp://localhost'});
    // will be close app wait a moment(after ack)
    await sleep();

    await manager.close();
    await closeApp(app);
  });

  it('should test listen a not exist channel and channel will be close by server', async () => {
    // create app and got data
    const app = await creatApp('base-app-not-exist-channel', {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      reconnectTime: 2000
    });
    // will be close app wait a moment(after ack)
    await sleep(6000);
    // 应该能看到两条错误输出
    await closeApp(app);
  });
});
