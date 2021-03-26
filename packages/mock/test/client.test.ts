import { createSocketIOClient, SocketIOWrapperClient } from '../src';
import { Server } from 'socket.io';
import { once } from 'events'

describe('/test/client.tes.ts', function () {
  it('should test socket.io-client', async () => {
    const server = new Server();
    const nsp = server.of('/test')
    server.listen(3000);

    let client: SocketIOWrapperClient;

    const connectionFuture = once(nsp, 'connection');
    client = await createSocketIOClient({
      port: 3000,
      namespace: '/test'
    });
    const [socket] = await connectionFuture;
    expect(socket.id).toBeDefined();

    const future = once(socket, 'xxx');
    client.send('xxx', {}, 'abc');
    const [data1, data2] = await future;
    expect(data1).toEqual({});
    expect(data2).toEqual('abc');


    // client.onMessage('got', () => {
    //
    // });

    client.close();
    server.close();
  });
});
