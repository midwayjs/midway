import { closeApp, createServer } from './utils';
import { sleep } from '@midwayjs/decorator';
import { once } from 'events';
import { createWebSocketClient } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {
  it('should test create websocket app', async () => {
    const app = await createServer('base-app', { port: 3000});
    const client = await createWebSocketClient(`ws://localhost:3000`);

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
    const app = await createServer('base-app-broadcast', { port: 3000});
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
});
