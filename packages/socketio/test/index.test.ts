import { closeApp, createServer } from './utils';
import { createRedisAdapter } from '../src';
import { createSocketIOClient } from '@midwayjs/mock';
import { once } from 'events';

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    const app = await createServer('base-app', { port: 3000});
    const client = await createSocketIOClient({
      port: 3000,
      namespace: '/test',
    });

    const data = await once(client as any, 'ok');
    console.log(data)
    client.send('my');

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
    const data = await once(client as any, 'ok');
    console.log(data)
    client.send('my');

    await client.close();
    await closeApp(app);
  });
});
