import {
  ServerResponse,
  ServerStreamOptions,
} from '@midwayjs/core';
import { Transform } from 'stream';
import { IMidwayCommanderContext } from './interface';

export class CliStreamResponse<
  CTX extends IMidwayCommanderContext = IMidwayCommanderContext
> extends Transform {
  private readonly ctx: CTX;
  private readonly options: ServerStreamOptions<CTX>;

  constructor(ctx: CTX, options: ServerStreamOptions<CTX> = {}) {
    super({
      objectMode: true,
      ...options,
    });
    this.ctx = ctx;
    this.options = options;
  }

  _transform(chunk, encoding, callback) {
    try {
      if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
        this.push(chunk);
      } else {
        this.push(JSON.stringify(chunk));
      }
      callback();
    } catch (err) {
      (this.ctx as any)?.logger?.error?.(err);
      this.end();
      callback(err);
    }
  }

  send(data: unknown) {
    if (!this.writable) {
      return;
    }
    const tpl = this.options.tpl ?? ((v: unknown) => v);
    this.write(tpl(data, this.ctx));
  }

  sendError(error: Error) {
    (this.ctx as any)?.logger?.error?.(error);
    this.end();
  }
}

export class CliServerResponse<
  CTX extends IMidwayCommanderContext = IMidwayCommanderContext
> extends ServerResponse<CTX> {
  static STREAM_TPL = <CTX extends IMidwayCommanderContext>(
    data: unknown,
    _ctx: CTX
  ) => {
    void _ctx;
    return data;
  };

  stream(options: ServerStreamOptions<CTX> = {}) {
    return new CliStreamResponse(this.ctx, {
      tpl: Object.getPrototypeOf(this).constructor.STREAM_TPL,
      ...options,
    });
  }
}
