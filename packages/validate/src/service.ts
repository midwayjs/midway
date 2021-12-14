import {
  Config,
  getClassExtendedMetadata,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as DefaultConfig from './config.default';
import { RULES_KEY } from './constants';
import { MidwayValidationError } from '@midwayjs/core';

import * as Joi from 'joi';
import { MidwayI18nService } from '../../i18n';

export function createCustomJoi() {
  return Joi.defaults(schema => {
    return schema.options({
      messages: {
        'zh-cn': {
          'string.base': '{{#label}} 必须是字符串',
        },
        en: {
          'string.base': '{{#label}} must be string11',
        },
      } as any,
    });
  });
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class ValidateService {
  @Config('validate')
  validateConfig: typeof DefaultConfig.validate;

  @Inject()
  i18n: MidwayI18nService;

  validate(
    ClzType: new (...args) => any,
    value: any,
    options?: {
      errorStatus?: number;
      validateOptions?: Joi.ValidationOptions;
    }
  ) {

    const rules = getClassExtendedMetadata(RULES_KEY, ClzType);
    if (rules) {
      const schema = Joi.object(rules);
      const result = schema.validate(
        value,
        Object.assign(
          this.validateConfig.validationOptions,
          options.validateOptions ?? {}
        )
      );
      if (result.error) {
        throw new MidwayValidationError(
          result.error.message,
          options?.errorStatus ?? this.validateConfig.errorStatus,
          result.error
        );
      } else {
        return result;
      }
    }
  }
}
