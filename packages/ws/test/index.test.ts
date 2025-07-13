import { closeApp, createServer, testConnectionRejected } from './utils';
import { sleep } from '@midwayjs/core';
import { once } from 'events';
import { createWebSocketClient } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {
  it('should test create websocket app', async () => {
    const app = await createServer('base-app');
    const client = await createWebSocketClient(`ws://localhost:3000`);

    client.on('ping', () => {
      console.log('got ping');
    });

    client.send(1);
    let gotEvent = once(client, 'message');
    let [data] = await gotEvent;
    expect(JSON.parse(data)).toEqual({
      name: 'harry',
      result: 6,
    });

    client.send(2);
    gotEvent = once(client, 'message');
    [data] = await gotEvent;
    expect(JSON.parse(data)).toEqual({
      name: 'harry',
      result: 7,
    });

    await sleep(1000);
    await client.close();
    await closeApp(app);
  });

  it('should test websocket broadcast', async () => {
    const app = await createServer('base-app-broadcast');
    const client1 = await createWebSocketClient(`ws://localhost:3000`);
    const client2 = await createWebSocketClient(`ws://localhost:3000`);

    await new Promise<void>(async (resolve, reject) => {
      let total = 0;
      client1.on('message', (result: any)  => {
        total += JSON.parse(result).result;
      });

      client2.on('message', (result: any)  => {
        total += JSON.parse(result).result;
      });

      // start broadcast
      client1.send(1);
      await sleep(500);

      if (total === 12) {
        resolve();
      } else {
        reject(new Error('result not match'));
      }
    })

    await sleep(500);
    await client1.close();
    await client2.close();
    await closeApp(app);
  });


  it('should test create socket and with filter', async () => {
    const app = await createServer('base-app-filter');
    const client = await createWebSocketClient(`ws://localhost:3000`);

    client.send(1);
    const gotEvent = once(client, 'message');
    const [data] = await gotEvent;
    expect(data.toString()).toEqual('packet error');

    await sleep();

    await client.close();
    await closeApp(app);
  });

  it('should test heartbeat timeout and terminate', async () => {
    const app = await createServer('base-app-heartbeat');
    const client = await createWebSocketClient(`ws://localhost:3000`);

    client.on('ping', () => {
      console.log('got ping');
    });

    client.send(1);
    let gotEvent = once(client, 'message');
    let [data] = await gotEvent;
    expect(JSON.parse(data)).toEqual({
      name: 'harry',
      result: 6,
    });

    await sleep(2000);

    // 客户端终止后，服务端会收到 disconnect 事件
    client.terminate();

    await sleep(2000);

    // 看一下服务端的 clients
    expect(app.clients.size).toEqual(0);

    await closeApp(app);
  });

  it('should test onWebSocketUpgrade authentication', async () => {
    const app = await createServer('base-app-upgrade-auth');

    // 测试1: 没有 token 的连接应该被拒绝
    const rejected1 = await testConnectionRejected('ws://localhost:3000');
    expect(rejected1).toBe(true);

    // 测试2: 无效 token 的连接应该被拒绝
    const rejected2 = await testConnectionRejected('ws://localhost:3000?token=invalid-token');
    expect(rejected2).toBe(true);

    // 测试3: 有效 token 的连接应该成功
    const client3 = await createWebSocketClient(`ws://localhost:3000?token=valid-token`);

    // 发送消息测试连接是否正常工作
    client3.send('test-message');
    const gotEvent = once(client3, 'message');
    const [data] = await gotEvent;
    const response = JSON.parse(data);

    expect(response.echo).toEqual('test-message');
    expect(response.timestamp).toBeDefined();

    await client3.close();
    await closeApp(app);
  });
});
