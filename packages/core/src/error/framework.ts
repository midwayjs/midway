import { MidwayError, registerErrorCode } from './base';
import { ObjectIdentifier } from '@midwayjs/decorator';

export const FrameworkErrorEnum = registerErrorCode('midway', {
  UNKNOWN: 10000,
  COMMON: 10001,
  PARAM_TYPE: 10002,
  DEFINITION_NOT_FOUND: 10003,
  FEATURE_NO_LONGER_SUPPORTED: 10004,
  FEATURE_NOT_IMPLEMENTED: 10004,
  MISSING_CONFIG: 10006,
  MISSING_RESOLVER: 10007,
  DUPLICATE_ROUTER: 10008,
  USE_WRONG_METHOD: 10009,
} as const);

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

export class MidwayFeatureNotImplementedError extends MidwayError {
  constructor(message?: string) {
    super(
      'This feature not implemented \n' + message,
      FrameworkErrorEnum.FEATURE_NOT_IMPLEMENTED
    );
  }
}

export class MidwayConfigMissingError extends MidwayError {
  constructor(configKey: string) {
    super(
      `Can't found config key "${configKey}" in your config, please set it first`,
      FrameworkErrorEnum.MISSING_CONFIG
    );
  }
}

export class MidwayResolverMissingError extends MidwayError {
  constructor(type: string) {
    super(
      `${type} resolver is not exists!`,
      FrameworkErrorEnum.MISSING_RESOLVER
    );
  }
}

export class MidwayDuplicateRouteError extends MidwayError {
  constructor(routerUrl: string, existPos: string, existPosOther: string) {
    super(
      `Duplicate router "${routerUrl}" at "${existPos}" and "${existPosOther}"`,
      FrameworkErrorEnum.DUPLICATE_ROUTER
    );
  }
}

export class MidwayUseWrongMethodError extends MidwayError {
  constructor(
    wrongMethod: string,
    replacedMethod: string,
    describeKey?: string
  ) {
    const text = describeKey
      ? `${describeKey} not valid by ${wrongMethod}, Use ${replacedMethod} instead!`
      : `You should not invoked by ${wrongMethod}, Use ${replacedMethod} instead!`;
    super(text, FrameworkErrorEnum.USE_WRONG_METHOD);
  }
}
