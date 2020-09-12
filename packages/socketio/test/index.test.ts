import * as socketClient from 'socket.io-client';
import { closeApp, creatApp } from './utils';


function createClient(opts: SocketIOClient.ConnectOpts) {
  let url = 'http://127.0.0.1:' + opts.port;
  if (opts.query) {
    url += '?' + opts.query;
  }
  return socketClient(url, opts);
}

describe('/test/index.test.ts', () => {
  it('should test create socket app and use default namespace', async () => {
    const app = await creatApp('base-app');
    app.listen(3000);
    const client = createClient({
      port: '3000'
    });
    client.emit('hello');
    await client.close();
    await closeApp(app);
  });
});
