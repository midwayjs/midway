import { closeApp, createServer } from './utils';
import { createRedisAdapter } from '../src';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';
import { sleep } from '@midwayjs/decorator';

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    const app = await createServer('base-app', { port: 3000});
    const client = await createSocketIOClient({
      port: 3000,
    });

    const gotEvent = once(client, 'ok');
    client.send('my', 1, 2, 3);
    const [data] = await gotEvent;
    expect(data).toEqual({
      name: 'harry',
      result: 6,
    });

    await client.close();
    await closeApp(app);
  });

  it('should test create socket app and with emit ack', async () => {
    const app = await createServer('base-app-ack', {
      port: 3000,
      path: '/test'
    });
    const client = await createSocketIOClient({
      port: 3000,
      path: '/test'
    });

    const result = await client.sendWithAck('my', 1, 2, 3);
    expect(result).toEqual({
      name: 'harry',
      result: 6,
    });

    await client.close();
    await closeApp(app);
  });

  it('should test create socket app with different namespace', async () => {
    const app = await createServer('base-app-namespace', { port: 3000});
    const client1 = await createSocketIOClient({
      port: 3000,
      namespace: '/',
    });
    const client2 = await createSocketIOClient({
      port: 3000,
      namespace: '/test',
    });
    const client3 = await createSocketIOClient({
      port: 3000,
      namespace: '/test2',
    });

    const gotEvent = once(client1, 'ok');
    client1.send('my');
    const [data1] = await gotEvent;
    expect(data1).toEqual({
      name: 'harry home',
    });

    const gotEvent2 = once(client2, 'ok');
    client2.send('my');
    const [data2] = await gotEvent2;
    expect(data2).toEqual({
      name: 'harry',
    });

    const gotEvent3 = once(client3, 'ok');
    client3.send('my');
    const [data] = await gotEvent3;
    expect(data).toEqual({
      name: 'harry 2',
    });

    await client1.close();
    await client2.close();
    await client3.close();
    await closeApp(app);
  });

  it('should test create socket app with room broadcast', async () => {
    const app = await createServer('base-app-room', { port: 3000});
    const clientParent = await createSocketIOClient({
      port: 3000,
      namespace: '/',
    });
    const client1 = await createSocketIOClient({
      port: 3000,
      namespace: '/',
    });
    const client2 = await createSocketIOClient({
      port: 3000,
      namespace: '/',
    });
    const client3 = await createSocketIOClient({
      port: 3000,
      namespace: '/',
    });

    // join room
    client1.send('joinRoom', 'room1');
    client2.send('joinRoom', 'room1');
    client3.send('joinRoom', 'room2');

    let total = 0;

    client1.on('broadcastResult', (result) => {
      expect(result).toEqual({ msg: 'room1 got message' });
      total++;
    });

    client2.on('broadcastResult', (result) => {
      expect(result).toEqual({ msg: 'room1 got message' });
      total++;
    });

    client3.on('broadcastResult', (result) => {
      expect(result).toEqual({ msg: 'room2 got message' });
      total += 2;
    });

    await sleep();

    // broadcast to room1
    clientParent.send('broadcast', 'room1');
    await sleep();

    expect(total).toEqual(2);

    clientParent.send('broadcast', 'room2');
    await sleep();

    expect(total).toEqual(4);

    await client1.close();
    await client2.close();
    await client3.close();
    await closeApp(app);
  });

  it.skip('should test create socket app and with redis adapter', async () => {
    const app = await createServer('base-app-redis', {
      port: 3000,
      adapter: createRedisAdapter({ host: '127.0.0.1', port: 6379}),
    });
    const client = await createSocketIOClient({
      port: '3000',
    });
    const gotEvent = once(client, 'ok');
    client.send('my');
    const [data] = await gotEvent;
    expect(data).toEqual({
      name: 'harry',
    });

    await client.close();
    await closeApp(app);
  });

  it('should test create socket app and throw error', async () => {
    const app = await createServer('base-app-error', { port: 3000});
    const client = await createSocketIOClient({
      port: 3000,
    });

    await new Promise<void>(async (resolve, reject) => {
      client.on('connect_error', err => {
        console.log(err);
        resolve();
      });
      client.send('my', 1, 2, 3);
      await closeApp(app);
    });

    await client.close();
  });
});
