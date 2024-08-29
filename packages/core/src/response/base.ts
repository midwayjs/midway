import { IMidwayContext } from '../interface';

export class ServerResponse<CTX extends IMidwayContext = IMidwayContext> {
  protected readonly ctx: any;
  protected isSuccess = true;

  constructor(ctx: CTX) {
    this.ctx = ctx;
  }

  static TEXT_TPL = (data: string, isSuccess: boolean): unknown => {
    return data;
  };

  static JSON_TPL = (data: Record<any, any>, isSuccess: boolean): unknown => {
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

  static BLOB_TPL = (data: Buffer, isSuccess: boolean): unknown => {
    return data;
  };

  json(data: Record<any, any>) {
    return Object.getPrototypeOf(this).constructor.JSON_TPL(
      data,
      this.isSuccess
    );
  }

  text(data: string) {
    return Object.getPrototypeOf(this).constructor.TEXT_TPL(
      data,
      this.isSuccess
    );
  }

  blob(data: Buffer) {
    return Object.getPrototypeOf(this).constructor.BLOB_TPL(
      data,
      this.isSuccess
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
