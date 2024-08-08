import { Transform } from 'stream';
import { IMidwayContext } from '../interface';

export class ServerResponse<CTX extends IMidwayContext = IMidwayContext> {
  protected readonly ctx: any;
  protected isSuccess = true;

  constructor(ctx: CTX) {
    this.ctx = ctx;
  }

  static SUCCESS_TPL = (data: string | Record<string, any>) => {
    return {
      success: 'true',
      data,
    } as any;
  };

  static FAIL_TPL = (data: string | Record<string, any>) => {
    return {
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

  json(data: Record<any, any>) {
    return ServerResponse.JSON_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  text(data: string) {
    return ServerResponse.TEXT_TPL(
      data,
      this.isSuccess,
      this.constructor as typeof ServerResponse
    );
  }

  blob(data: Buffer) {
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

  custom(stream: Transform) {
    return stream;
  }
}
