import * as WebSocket from 'ws';
import * as http from 'http';
import * as url from 'url';

export async function createWebSocketClient(
  address: string | url.URL,
  options?: WebSocket.ClientOptions | http.ClientRequestArgs
) {
  const WebSocket = require('ws');
  const client = new WebSocket(address, options);
  return new Promise<WebSocket>(resolve => {
    client.on('open', () => {
      resolve(client);
    });
  });
}
