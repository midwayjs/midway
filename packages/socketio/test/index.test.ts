import { closeApp, createServer } from './utils';
import { createRedisAdapter } from '../src';
import { createSocketIOClient } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    const app = await createServer('base-app', { port: 3000});
    const client = createSocketIOClient({
      port: 3000,
      namespace: '/test',
    })

    await new Promise<void>(resolve =>  {
      client.on('connect', () => {
        client.on('ok', (data) => {
          console.log(data);
          resolve();
        })
        client.emit('my');
      })
    });

    await client.close();
    await closeApp(app);
  });

  it('should test create socket app and with redis adapter', async () => {
    const app = await createServer('base-app-redis', {
      port: 3000,
      adapter: createRedisAdapter({ host: '127.0.0.1', port: 6379}),
    });
    const client = await createSocketIOClient({
      port: '3000',
    });
    await new Promise<void>(resolve =>  {
      client.on('ok', (data) => {
        console.log(data);
        resolve();
      })
      client.emit('my');
    });

    await client.close();
    await closeApp(app);
  });
});
