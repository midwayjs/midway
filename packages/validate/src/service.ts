import {
  Config,
  getClassExtendedMetadata,
  Provide,
  Scope,
  ScopeEnum,
  Inject,
  Init,
} from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { RULES_KEY } from './constants';
import { MidwayValidationError } from '@midwayjs/core';
import * as Joi from 'joi';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ValidateService {
  @Config('validate')
  validateConfig: typeof DefaultConfig.validate;

  @Config('i18n')
  i18nConfig;

  @Inject()
  i18nService: MidwayI18nServiceSingleton;

  messages = {};

  @Init()
  async init() {
    const locales = Object.keys(DefaultConfig.i18n.localeTable);
    locales.forEach(locale => {
      this.messages[locale] = Object.fromEntries(
        this.i18nService.getLocaleMapping(locale, 'validate')
      );
    });
  }

  validate(
    ClzType: new (...args) => any,
    value: any,
    options?: {
      errorStatus?: number;
      locale?: string;
      validationOptions?: Joi.ValidationOptions;
    }
  ) {
    options.validationOptions = options.validationOptions || {};
    options.validationOptions.errors = options.validationOptions.errors || {};
    options.validationOptions.errors.language =
      this.i18nService.getAvailableLocale(
        options.validationOptions.errors.language ||
          options.locale ||
          this.i18nConfig.defaultLocale,
        'validate'
      );

    const rules = getClassExtendedMetadata(RULES_KEY, ClzType);
    if (rules) {
      const schema = Joi.object(rules);
      const result = schema.validate(
        value,
        Object.assign(
          this.validateConfig.validationOptions,
          {
            messages: this.messages,
          },
          options.validationOptions ?? {}
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
