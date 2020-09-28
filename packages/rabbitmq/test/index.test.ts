import { createRabbitMQProducer } from '@midwayjs/mock';
import { closeApp, creatApp } from './utils';

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    // create a queue and channel
    const channel = await createRabbitMQProducer('tasks');
    // send data to queue
    channel.sendToQueue('tasks', Buffer.from('something to do'))

    // create app and got data
    const app = await creatApp('base-app', { url: 'amqp://localhost'});
    await closeApp(app);
  });
});
