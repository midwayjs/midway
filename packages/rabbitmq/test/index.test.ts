const { AmqpConnectionManager } = require('amqp-connection-manager');
AmqpConnectionManager.prototype._connect = () => {}
import { closeApp, creatApp } from './utils';

async function createProducer() {
  const connection = new AmqpConnectionManager(['amqp://localhost']);
  const channelWrapper = connection.createChannel({
    json: true,
    setup: function (channel) {
      // `channel` here is a regular amqplib `ConfirmChannel`.
      // Note that `this` here is the channelWrapper instance.
      return channel.assertQueue('test', { durable: true });
    }
  });
  const isSuccesss = await channelWrapper.sendToQueue('test', { hello: 'world' });
  console.log('send success', isSuccesss);

  return channelWrapper;
}

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    await createProducer();
    const app = await creatApp('base-app', { url: 'amqp://localhost'});
    await closeApp(app);
  });
});
