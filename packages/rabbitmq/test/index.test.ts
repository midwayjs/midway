import { createRabbitMQProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';
import { loggers } from '@midwayjs/logger';
import { sleep } from '@midwayjs/decorator';

loggers.updateConsoleLevel('silly');

describe('/test/index.test.ts', () => {
  it('should test create channel with legacy method', async () => {
    // create a queue and channel
    const channel = await createRabbitMQProducer('tasks', {
      isConfirmChannel: true,
      mock: false,
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
    });
    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'));

    // create app and got data
    const app = await creatApp('base-app', { url: process.env.RABBITMQ_URL || 'amqp://localhost'});
    // will be close app wait a moment(after ack)
    await sleep();

    await channel.close();
    await closeApp(app);
  });

  it('should test create channel with new method', async () => {
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

  it('should test fanout publish and subscribe', async () => {

    const manager = await createRabbitMQProducer('tasks-fanout', {
      isConfirmChannel: false,
      mock: false,
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
    });

    // Name of the exchange
    const ex = 'logs';
    // Write a message
    const msg = "Hello World!";

    // Declare the exchange
    manager.assertExchange(ex, 'fanout', { durable: false }) // 'fanout' will broadcast all messages to all the queues it knows

    const app = await creatApp('base-app-fanout', {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      reconnectTime: 2000
    });

    // 由于不持久化，需要等订阅服务起来之后再发
    // Send message to the exchange
    manager.sendToExchange(ex, '', Buffer.from(msg))

    // will be close app wait a moment
    await sleep(5000);

    expect(app.getAttr('total')).toEqual(2);

    await manager.close();
    await closeApp(app);
  });

  it('should test direct publish and subscribe', async () => {
    /**
     * direct 类型的消息，根据 routerKey 做定向过滤
     */
    const manager = await createRabbitMQProducer('tasks-direct', {
      isConfirmChannel: false,
      mock: false,
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
    });

    // Name of the exchange
    const ex = 'direct_logs';
    // Write a message
    const msg = "Hello World!";

    // Declare the exchange
    manager.assertExchange(ex, 'direct', { durable: false }) // 'fanout' will broadcast all messages to all the queues it knows

    const app = await creatApp('base-app-direct', {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      reconnectTime: 2000
    });

    // 这里指定 routerKey
    manager.sendToExchange(ex, 'direct_key', Buffer.from(msg))

    // will be close app wait a moment
    await sleep(5000);

    expect(app.getAttr('total')).toEqual(1);

    await manager.close();
    await closeApp(app);
  });
});
