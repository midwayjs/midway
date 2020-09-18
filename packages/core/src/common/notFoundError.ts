import { ObjectIdentifier } from '@midwayjs/decorator';

export class NotFoundError extends Error {
  static readonly type = Symbol.for('#NotFoundError');
  static isClosePrototypeOf(ins: NotFoundError): boolean {
    return ins ? ins[NotFoundError.type] === NotFoundError.type : false;
  }
  constructor(identifier: ObjectIdentifier) {
    super(`${identifier} is not valid in current context`);
    this[NotFoundError.type] = NotFoundError.type;
  }
  updateErrorMsg(className: string): void {
    const identifier = this.message.split(
      ' is not valid in current context'
    )[0];
    const msg = `${identifier} in class ${className} is not valid in current context`;
    this.message = msg;
  }
}
