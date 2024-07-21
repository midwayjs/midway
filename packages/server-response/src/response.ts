import { createReadStream } from 'fs';
import { ServerSendEventStream } from './sse';
import { ServerResponseStream } from './stream';
import { Transform } from 'stream';
import { ServerSendEventStreamOptions } from './interface';
import { Readable } from 'node:stream';

export class ServerResponse {
  private readonly ctx: any;
  private isSuccess = true;

  constructor(ctx) {
    this.ctx = ctx;
  }

  static SUCCESS_TPL = (data: string) => {
    return {
      code: 0,
      status: 200,
      success: 'true',
      data,
    } as any;
  };

  static FAIL_TPL = (data: string) => {
    return {
      code: -1,
      status: 500,
      success: 'false',
      message: data || 'fail',
    } as any;
  };

  static TEXT_TPL = (
    data: string,
    isSuccess: boolean,
    proto: typeof ServerResponse = ServerResponse
  ) => {
    if (isSuccess) {
      return proto.SUCCESS_TPL(data);
    } else {
      return proto.FAIL_TPL(data);
    }
  };

  static JSON_TPL = (
    data: Record<any, any>,
    isSuccess: boolean,
    proto: typeof ServerResponse = ServerResponse
  ) => {
    if (isSuccess) {
      return proto.SUCCESS_TPL(JSON.stringify(data));
    } else {
      return proto.FAIL_TPL(JSON.stringify(data));
    }
  };

  static BLOB_TPL = (
    data: Buffer,
    isSuccess: boolean,
    proto: typeof ServerResponse = ServerResponse
  ) => {
    return data;
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

  json(data: Record<any, any>) {
    this.ctx.res.writeHead('Content-Type', 'application/json');
    return ServerResponse.JSON_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  text(data: string) {
    this.ctx.res.writeHead('Content-Type', 'text/plain');
    return ServerResponse.TEXT_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  file(filePath: string, mimeType?: string) {
    this.ctx.res.writeHead(
      'Content-Type',
      mimeType || 'application/octet-stream'
    );
    return ServerResponse.FILE_TPL(
      createReadStream(filePath),
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  blob(data: Buffer) {
    this.ctx.res.writeHead('Content-Type', 'application/octet-stream');
    return ServerResponse.BLOB_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  success() {
    this.isSuccess = true;
    return this;
  }

  fail() {
    this.isSuccess = false;
    return this;
  }

  sse(options: ServerSendEventStreamOptions = {}): ServerSendEventStream {
    return new ServerSendEventStream(this.ctx, options);
  }

  stream(): ServerResponseStream {
    return new ServerResponseStream(this.ctx);
  }

  custom(stream: Transform) {
    return stream;
  }
}
