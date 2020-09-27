const { connect } = require('./mock');
const amqp = require('amqplib');
amqp.connect = connect;

import { closeApp, creatApp } from './utils';

async function createProducer(queueName: string) {
  const connection = await amqp.connect('amqp://localhost');
  const ch = await connection.createConfirmChannel();
  await ch.assertQueue(queueName);
  await ch.sendToQueue(queueName, Buffer.from('something to do'));
  return ch;
}

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    await createProducer('tasks');
    const app = await creatApp('base-app', { url: 'amqp://localhost'});
    await closeApp(app);
  });
});
