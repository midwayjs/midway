import { IMidwayContext } from '../interface';

export class ServerResponse<CTX extends IMidwayContext = IMidwayContext> {
  protected readonly ctx: any;
  protected isSuccess = true;

  constructor(ctx: CTX) {
    this.ctx = ctx;
  }

  static TEXT_TPL = <CTX extends IMidwayContext>(
    data: string,
    isSuccess: boolean,
    ctx: CTX
  ): unknown => {
    return data;
  };

  static JSON_TPL = <CTX extends IMidwayContext>(
    data: Record<any, any>,
    isSuccess: boolean,
    ctx: CTX
  ): unknown => {
    if (isSuccess) {
      return {
        success: 'true',
        data,
      };
    } else {
      return {
        success: 'false',
        message: data || 'fail',
      };
    }
  };

  static BLOB_TPL = <CTX extends IMidwayContext>(
    data: Buffer,
    isSuccess: boolean,
    ctx: CTX
  ): unknown => {
    return data;
  };

  json(data: Record<any, any>) {
    return Object.getPrototypeOf(this).constructor.JSON_TPL(
      data,
      this.isSuccess,
      this.ctx
    );
  }

  text(data: string) {
    return Object.getPrototypeOf(this).constructor.TEXT_TPL(
      data,
      this.isSuccess,
      this.ctx
    );
  }

  blob(data: Buffer) {
    return Object.getPrototypeOf(this).constructor.BLOB_TPL(
      data,
      this.isSuccess,
      this.ctx
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
}
