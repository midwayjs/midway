import { createReadStream } from 'fs';
import {
  IMidwayContext,
  ServerSendEventMessage,
  ServerSendEventStreamOptions,
  ServerStreamOptions,
} from '../interface';
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

  static FILE_TPL = <CTX extends IMidwayContext>(
    data: Readable,
    isSuccess: boolean,
    ctx: CTX
  ) => {
    return data;
  };

  static SSE_TPL = <CTX extends IMidwayContext>(
    data: ServerSendEventMessage,
    ctx: CTX
  ) => {
    return data;
  };

  static STREAM_TPL = <CTX extends IMidwayContext>(data: unknown, ctx: CTX) => {
    return data;
  };

  static HTML_TPL = <CTX extends IMidwayContext>(
    data: string,
    isSuccess: boolean,
    ctx: CTX
  ): unknown => {
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
      this.isSuccess,
      this.ctx
    );
  }

  text(data: string) {
    this.header('Content-Type', 'text/plain');
    return Object.getPrototypeOf(this).constructor.TEXT_TPL(
      data,
      this.isSuccess,
      this.ctx
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
      this.isSuccess,
      this.ctx
    );
  }

  blob(data: Buffer, mimeType?: string) {
    this.header('Content-Type', mimeType || 'application/octet-stream');
    return Object.getPrototypeOf(this).constructor.BLOB_TPL(
      data,
      this.isSuccess,
      this.ctx
    );
  }

  html(data: string) {
    this.header('Content-Type', 'text/html');
    return Object.getPrototypeOf(this).constructor.HTML_TPL(
      data,
      this.isSuccess,
      this.ctx
    );
  }

  notFound(status = 404, text = 'Not Found') {
    return this.status(status).text(text);
  }

  redirect(url: string, status = 302) {
    this.status(status);
    if (this.ctx.redirect) {
      return this.ctx.redirect(url);
    } else if (this.ctx.res.redirect) {
      return this.ctx.res.redirect(url);
    } else {
      this.header('Location', url);
    }
  }

  sse(options: ServerSendEventStreamOptions<CTX> = {}) {
    return new ServerSendEventStream(this.ctx, {
      tpl: Object.getPrototypeOf(this).constructor.SSE_TPL,
      ...options,
    });
  }

  stream(options: ServerStreamOptions<CTX> = {}) {
    return new HttpStreamResponse(this.ctx, {
      tpl: Object.getPrototypeOf(this).constructor.STREAM_TPL,
      ...options,
    });
  }
}
