import { createReadStream } from 'fs';
import { IMidwayContext, ServerSendEventStreamOptions } from '../interface';
import { ServerResponse } from './base';
import { ServerSendEventStream } from './sse';
import { Readable } from 'stream';
import { HttpStreamResponse } from './stream';

export class HttpServerResponse<
  CTX extends IMidwayContext
> extends ServerResponse<CTX> {
  constructor(ctx: CTX) {
    super(ctx);
  }

  static SUCCESS_TPL = (data: string | object) => {
    return {
      success: 'true',
      data,
    } as any;
  };

  static FAIL_TPL = (data: string | object) => {
    return {
      success: 'false',
      message: data || 'fail',
    } as any;
  };

  static JSON_TPL = (
    data: Record<any, any>,
    isSuccess: boolean,
    proto: typeof ServerResponse = ServerResponse
  ) => {
    if (isSuccess) {
      return proto.SUCCESS_TPL(data);
    } else {
      return proto.FAIL_TPL(data);
    }
  };

  static FILE_TPL = (
    data: Readable,
    isSuccess: boolean,
    proto: typeof ServerResponse = ServerResponse
  ) => {
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
    this.ctx.res.setHeaders(headers);
    return this;
  }

  json(data: Record<any, any>) {
    this.header('Content-Type', 'application/json');
    return HttpServerResponse.JSON_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  text(data: string) {
    this.header('Content-Type', 'text/plain');
    return HttpServerResponse.TEXT_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  file(filePath: string, mimeType?: string) {
    this.header('Content-Type', mimeType || 'application/octet-stream');
    this.header('Content-Disposition', `attachment; filename=${filePath}`);
    return HttpServerResponse.FILE_TPL(
      createReadStream(filePath),
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  blob(data: Buffer) {
    this.header('Content-Type', 'application/octet-stream');
    return HttpServerResponse.BLOB_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  sse(options: ServerSendEventStreamOptions = {}) {
    return new ServerSendEventStream(this.ctx, options);
  }

  stream(options = {}) {
    return new HttpStreamResponse(this.ctx, options);
  }
}
