import { Transform } from 'stream';
import { ServerStreamOptions } from '../interface';

export class HttpStreamResponse extends Transform {
  private ctx: any;
  private isActive = false;
  private options: ServerStreamOptions;

  constructor(ctx, options: ServerStreamOptions = {}) {
    super({
      objectMode: true,
      ...options,
    });
    this.ctx = ctx;
    this.options = options;
  }

  _transform(chunk, encoding, callback) {
    try {
      if (!this.isActive) {
        this.isActive = true;
        this.ctx.res.statusCode = 200;
        this.ctx.res.setHeader('Transfer-Encoding', 'chunked');
        this.ctx.res.setHeader('Cache-Control', 'no-cache');
        this.ctx.req.socket.setTimeout(0);
      }

      if (typeof chunk === 'string') {
        this.ctx.res.write(chunk);
      } else {
        this.ctx.res.write(JSON.stringify(chunk));
      }
      callback();
    } catch (err) {
      this.ctx.logger.error(err);
      // close stream
      this.end();
      this.ctx.res.end();
      callback(err);
    }
  }

  send(data: unknown) {
    if (!this.writable) {
      return;
    }
    this.write(this.options.tpl(data));
  }

  sendError(error) {
    this.ctx.logger.error(error);
    this.end();
    this.ctx.res.end();
  }

  _flush(callback) {
    this.ctx.res.end();
    callback();
  }
}
