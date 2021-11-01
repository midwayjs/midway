import { MidwayBaseException } from './base';
import { FrameworkExceptionEnum } from './code';

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
