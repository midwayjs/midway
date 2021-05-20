import { closeApp, createServer } from './utils';
import * as WebSocket from 'ws';
import { sleep } from '@midwayjs/decorator';
// import { once } from 'events';

describe('/test/index.test.ts', () => {
  it('should test create websocket app', async () => {
    const app = await createServer('base-app', { port: 3000});

    const client = new WebSocket(`ws://localhost:3000`);

    // client.on('open', function open() {
    //   client.send('something');
    // });
    //
    // const gotEvent = once(client, 'message');
    // client.emit('my', 1, 2, 3);
    // const [data] = await gotEvent;
    // expect(data).toEqual({
    //   name: 'harry',
    //   result: 6,
    // });

    await sleep(1000);
    await client.close();
    await closeApp(app);
  });
});
