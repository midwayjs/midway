import * as socketClient from 'socket.io-client';
import { closeApp, createServer } from './utils';

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
});
