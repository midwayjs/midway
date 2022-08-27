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
  SINGLETON_INJECT_REQUEST: 10010,
  MISSING_IMPORTS: 10011,
  UTIL_HTTP_TIMEOUT: 10012,
  INCONSISTENT_VERSION: 10013,
  INVALID_CONFIG: 10014,
  DUPLICATE_CLASS_NAME: 10015,
  DUPLICATE_CONTROLLER_PREFIX_OPTIONS: 10016,
  RETRY_OVER_MAX_TIME: 10017,
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

export class MidwayInvalidConfigError extends MidwayError {
  constructor(message?: string) {
    super(
      'Invalid config file \n' + message,
      FrameworkErrorEnum.INVALID_CONFIG
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

export class MidwaySingletonInjectRequestError extends MidwayError {
  constructor(singletonScopeName: string, requestScopeName: string) {
    const text = `${singletonScopeName} with singleton scope can't implicitly inject ${requestScopeName} with request scope directly, please add "@Scope(ScopeEnum.Request, { allowDowngrade: true })" in ${requestScopeName} or use "ctx.requestContext.getAsync(${requestScopeName})".`;
    super(text, FrameworkErrorEnum.SINGLETON_INJECT_REQUEST);
  }
}

export class MidwayMissingImportComponentError extends MidwayError {
  constructor(originName: string) {
    const text = `"${originName}" can't inject and maybe forgot add "{imports: [***]}" in @Configuration.`;
    super(text, FrameworkErrorEnum.MISSING_IMPORTS);
  }
}

export class MidwayUtilHttpClientTimeoutError extends MidwayError {
  constructor(message: string) {
    super(message, FrameworkErrorEnum.UTIL_HTTP_TIMEOUT);
  }
}

export class MidwayInconsistentVersionError extends MidwayError {
  constructor() {
    const text =
      'We find a latest dependency package installed, please remove the lock file and use "npm update" to upgrade all dependencies first.';
    super(text, FrameworkErrorEnum.INCONSISTENT_VERSION);
  }
}

export class MidwayDuplicateClassNameError extends MidwayError {
  constructor(className: string, existPath: string, existPathOther: string) {
    super(
      `"${className}" duplicated between "${existPath}" and "${existPathOther}"`,
      FrameworkErrorEnum.DUPLICATE_CLASS_NAME
    );
  }
}

export class MidwayDuplicateControllerOptionsError extends MidwayError {
  constructor(
    prefix: string,
    existController: string,
    existControllerOther: string
  ) {
    super(
      `"Prefix ${prefix}" with duplicated controller options between "${existController}" and "${existControllerOther}"`,
      FrameworkErrorEnum.DUPLICATE_CONTROLLER_PREFIX_OPTIONS
    );
  }
}

export class MidwayRetryExceededMaxTimesError extends MidwayError {
  constructor(methodName, times: number, err: Error) {
    super(
      `Invoke "${methodName}" retries exceeded the maximum number of times(${times}), error: ${err.message}`,
      FrameworkErrorEnum.RETRY_OVER_MAX_TIME,
      {
        cause: err,
      }
    );
  }
}
