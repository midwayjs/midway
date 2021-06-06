import { createRabbitMQProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';
import { loggers } from '@midwayjs/logger';

describe('/test/index.test.ts', () => {
  it('should test create channel', async () => {
    loggers.updateConsoleLevel('silly');
    // create a queue and channel
    const channel = await createRabbitMQProducer('tasks', {
      mock: false,
      isConfirmChannel: true,
    });
    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'));

    // create app and got data
    const app = await creatApp('base-app', { url: 'amqp://localhost'});
    await closeApp(app);
    log();
  });
});
