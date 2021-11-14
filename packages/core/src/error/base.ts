import { FrameworkErrorEnum } from './code';

interface ErrorOption {
  cause: Error;
}

export class MidwayError extends Error {
  code: number;
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
  }
}
