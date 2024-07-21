import { Transform } from 'stream';
import { ServerSendEventStreamOptions } from './interface';

export class ServerResponseStream extends Transform {
  private ctx: any;
  private isActive = false;

  constructor(ctx, options: ServerSendEventStreamOptions = {}) {
    super({
      objectMode: true,
      ...options,
    });
    this.ctx = ctx;
  }

  _transform(chunk, encoding, callback) {
    if (!this.isActive) {
      this.isActive = true;
      this.ctx.status = 200;
      this.ctx.set('Transfer-Encoding', 'chunked');
      this.ctx.set('Cache-Control', 'no-cache');
      this.ctx.req.socket.setTimeout(0);
    }

    if (typeof chunk === 'string') {
      this.ctx.res.write(chunk);
    } else {
      this.ctx.res.write(JSON.stringify(chunk));
    }
  }

  _flush(callback) {
    this.ctx.res.end();
    callback();
  }
}
