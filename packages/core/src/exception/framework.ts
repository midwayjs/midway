import { MidwayBaseException } from './base';
import { FrameworkExceptionEnum } from './code';
import { ObjectIdentifier } from '@midwayjs/decorator';

export class MidwayCommonException extends MidwayBaseException {
  constructor(message: string) {
    super(message, FrameworkExceptionEnum.COMMON);
  }
}

export class MidwayParameterException extends MidwayBaseException {
  constructor(message?: string) {
    super(
      message ?? 'Parameter type not match',
      FrameworkExceptionEnum.PARAM_TYPE
    );
  }
}

export class MidwayDefinitionNotFoundException extends MidwayBaseException {
  static readonly type = Symbol.for('#NotFoundError');
  static isClosePrototypeOf(ins: MidwayDefinitionNotFoundException): boolean {
    return ins
      ? ins[MidwayDefinitionNotFoundException.type] ===
          MidwayDefinitionNotFoundException.type
      : false;
  }
  constructor(identifier: ObjectIdentifier) {
    super(
      `${identifier} is not valid in current context`,
      FrameworkExceptionEnum.PARAM_TYPE
    );
    this[MidwayDefinitionNotFoundException.type] =
      MidwayDefinitionNotFoundException.type;
  }
  updateErrorMsg(className: string): void {
    const identifier = this.message.split(
      ' is not valid in current context'
    )[0];
    const msg = `${identifier} in class ${className} is not valid in current context`;
    this.message = msg;
  }
}
