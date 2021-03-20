import * as socketClient from 'socket.io-client';
import { closeApp, createServer } from './utils';
import { createRedisAdapter } from '../src/util';

function createClient(opts: SocketIOClient.ConnectOpts) {
  let url = 'http://127.0.0.1:' + opts.port;
  if (opts.query) {
    url += '?' + opts.query;
  }
  return socketClient(url, opts);
}

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    const app = await createServer('base-app', { port: 3000});
    const client = await createClient({
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

  it('should test create socket app and with redis adapter', async () => {
    const app = await createServer('base-app-redis', {
      port: 3000,
      adapter: createRedisAdapter({ host: '127.0.0.1', port: 6379}),
    });
    const client = await createClient({
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
