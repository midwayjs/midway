import { MidwayError } from './base';
import { FrameworkErrorEnum } from './code';
import { ObjectIdentifier } from '@midwayjs/decorator';

export class MidwayCommonError extends MidwayError {
  constructor(message: string) {
    super(message, FrameworkErrorEnum.COMMON);
  }
}

export class MidwayParameterError extends MidwayError {
  constructor(message?: string) {
    super(message ?? 'Parameter type not match', FrameworkErrorEnum.PARAM_TYPE);
  }
}

export class MidwayDefinitionNotFoundError extends MidwayError {
  static readonly type = Symbol.for('#NotFoundError');
  static isClosePrototypeOf(ins: MidwayDefinitionNotFoundError): boolean {
    return ins
      ? ins[MidwayDefinitionNotFoundError.type] ===
          MidwayDefinitionNotFoundError.type
      : false;
  }
  constructor(identifier: ObjectIdentifier) {
    super(
      `${identifier} is not valid in current context`,
      FrameworkErrorEnum.DEFINITION_NOT_FOUND
    );
    this[MidwayDefinitionNotFoundError.type] =
      MidwayDefinitionNotFoundError.type;
  }
  updateErrorMsg(className: string): void {
    const identifier = this.message.split(
      ' is not valid in current context'
    )[0];
    this.message = `${identifier} in class ${className} is not valid in current context`;
  }
}

export class MidwayFeatureNoLongerSupportedError extends MidwayError {
  constructor(message?: string) {
    super(
      'This feature no longer supported \n' + message,
      FrameworkErrorEnum.FEATURE_NO_LONGER_SUPPORTED
    );
  }
}

export class MidwayNoFrameworkFoundError extends MidwayError {
  constructor() {
    super(
      'You must add a component that contains @Framework at least, such as @midwayjs/web, @midwayjs/koa, etc.',
      FrameworkErrorEnum.NO_FRAMEWORK_FOUND
    );
  }
}
