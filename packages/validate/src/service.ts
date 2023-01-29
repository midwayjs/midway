import {
  Config,
  getClassExtendedMetadata,
  Provide,
  Scope,
  ScopeEnum,
  Inject,
  Init,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { RULES_KEY } from './constants';
import * as Joi from 'joi';
import { MidwayI18nServiceSingleton, formatLocale } from '@midwayjs/i18n';
import { MidwayValidationError } from './error';
import { ObjectSchema, AnySchema } from 'joi';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ValidateService {
  @Config('validate')
  protected validateConfig: typeof DefaultConfig.validate;

  @Config('i18n')
  protected i18nConfig;

  @Inject()
  protected i18nService: MidwayI18nServiceSingleton;

  protected messages = {};

  @Init()
  protected async init() {
    const locales = Object.keys(DefaultConfig.i18n.localeTable);
    locales.forEach(locale => {
      this.messages[formatLocale(locale)] = Object.fromEntries(
        this.i18nService.getLocaleMapping(locale, 'validate')
      );
    });
  }

  public validate<T extends new (...args) => any>(
    ClzType: T,
    value: any,
    options: {
      errorStatus?: number;
      locale?: string;
      validationOptions?: Joi.ValidationOptions;
    } = {}
  ): Joi.ValidationResult<T> | undefined {
    const objectSchema = this.getSchema(ClzType);
    return this.validateWithSchema(objectSchema, value, options);
  }

  public validateWithSchema<T>(
    schema: AnySchema<T>,
    value: any,
    options: {
      errorStatus?: number;
      locale?: string;
      validationOptions?: Joi.ValidationOptions;
    } = {}
  ): Joi.ValidationResult<T> | undefined {
    if (!schema) {
      return undefined;
    }

    options.validationOptions = options.validationOptions || {};
    options.validationOptions.errors = options.validationOptions.errors || {};
    options.validationOptions.errors.language = formatLocale(
      this.i18nService.getAvailableLocale(
        options.validationOptions.errors.language ||
          options.locale ||
          this.i18nConfig.defaultLocale,
        'validate'
      )
    );

    const result = schema.validate(
      value,
      Object.assign(
        {},
        this.validateConfig.validationOptions ?? {},
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

  public getSchema<T extends new (...args) => any>(
    ClzType: T
  ): ObjectSchema<any> {
    return getSchema(ClzType);
  }
}

export function getSchema<T extends new (...args) => any>(
  ClzType: T
): ObjectSchema<any> {
  const rules = getClassExtendedMetadata(RULES_KEY, ClzType);
  if (rules) {
    return Joi.object(rules);
  }
}
