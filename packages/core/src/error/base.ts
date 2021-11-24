import { FrameworkErrorEnum } from './code';

interface ErrorOption {
  cause?: Error;
  status?: number;
}

export class MidwayError extends Error {
  code: number;
  status: number;
  cause: Error;

  constructor(message: string, options?: ErrorOption);
  constructor(message: string, code: number, options?: ErrorOption);
  constructor(message: string, code: any, options?: ErrorOption) {
    super(message);
    if (typeof code !== 'number') {
      options = code;
      code = FrameworkErrorEnum.UNKNOWN;
    }
    this.name = this.constructor.name;
    this.code = code;
    this.cause = options?.cause;
    this.status = options?.status;
  }
}
