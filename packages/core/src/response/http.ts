import { createReadStream } from 'fs';
import { IMidwayContext, ServerSendEventStreamOptions } from '../interface';
import { ServerResponse } from './base';
import { ServerSendEventStream } from './sse';
import { Readable } from 'stream';
import { HttpStreamResponse } from './stream';
import { basename } from 'path';

export class HttpServerResponse<
  CTX extends IMidwayContext
> extends ServerResponse<CTX> {
  constructor(ctx: CTX) {
    super(ctx);
  }

  static FILE_TPL = (data: Readable, isSuccess: boolean) => {
    return data;
  };

  status(code: number) {
    this.ctx.res.statusCode = code;
    return this;
  }

  header(key: string, value: string) {
    this.ctx.res.setHeader(key, value);
    return this;
  }

  headers(headers: Record<string, string>) {
    if (this.ctx.res.setHeaders) {
      this.ctx.res.setHeaders(new Map(Object.entries(headers)));
    } else {
      for (const key in headers) {
        this.header(key, headers[key]);
      }
    }
    return this;
  }

  json(data: Record<any, any>) {
    this.header('Content-Type', 'application/json');
    return Object.getPrototypeOf(this).constructor.JSON_TPL(
      data,
      this.isSuccess
    );
  }

  text(data: string) {
    this.header('Content-Type', 'text/plain');
    return Object.getPrototypeOf(this).constructor.TEXT_TPL(
      data,
      this.isSuccess
    );
  }

  file(filePath: string, mimeType?: string) {
    this.header('Content-Type', mimeType || 'application/octet-stream');
    this.header(
      'Content-Disposition',
      `attachment; filename=${basename(filePath)}`
    );
    return Object.getPrototypeOf(this).constructor.FILE_TPL(
      typeof filePath === 'string' ? createReadStream(filePath) : filePath,
      this.isSuccess
    );
  }

  blob(data: Buffer, mimeType?: string) {
    this.header('Content-Type', mimeType || 'application/octet-stream');
    return Object.getPrototypeOf(this).constructor.BLOB_TPL(
      data,
      this.isSuccess
    );
  }

  sse(options: ServerSendEventStreamOptions = {}) {
    return new ServerSendEventStream(this.ctx, options);
  }

  stream(options = {}) {
    return new HttpStreamResponse(this.ctx, options);
  }
}
