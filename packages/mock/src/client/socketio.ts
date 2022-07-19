import type { ManagerOptions, SocketOptions, Socket } from 'socket.io-client';

export interface MidwaySocketIOClientOptions
  extends Partial<ManagerOptions & SocketOptions> {
  url?: string;
  protocol?: string;
  host?: string;
  namespace?: string;
  port?: any;
}

export class SocketIOWrapperClient {
  private readonly socket: Socket;
  constructor(socket) {
    this.socket = socket;
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        resolve(this.socket);
      });
    });
  }

  getSocket() {
    return this.socket;
  }

  send(eventName: string, ...args) {
    this.socket.emit(eventName, ...args);
  }

  on(eventName: string, handler) {
    this.socket.on(eventName, handler);
  }

  once(eventName: string, handler) {
    return this.socket.once(eventName, handler);
  }

  removeListener(event: string, fn?) {
    return this.socket.removeListener(event, fn);
  }

  emit(eventName: string, ...args) {
    return this.socket.emit(eventName, ...args);
  }

  async sendWithAck(eventName: string, ...args) {
    return new Promise((resolve, reject) => {
      this.socket.emit(eventName, ...args, resolve);
    });
  }

  close() {
    this.socket.close();
  }
}

export async function createSocketIOClient(
  opts: MidwaySocketIOClientOptions
): Promise<SocketIOWrapperClient & NodeJS.EventEmitter> {
  let url;
  if (opts.url) {
    url = opts.url;
  } else {
    url = `${opts.protocol || 'http'}://${opts.host || '127.0.0.1'}:${
      opts.port || 80
    }`;
    delete opts['port'];
  }

  if (opts.namespace) {
    url += opts.namespace;
  }
  const socket = require('socket.io-client')(url, opts);
  const client = new SocketIOWrapperClient(socket);
  await client.connect();
  return client as any;
}
