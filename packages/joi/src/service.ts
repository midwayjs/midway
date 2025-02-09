import { Config, Inject, Singleton } from '@midwayjs/core';
import * as Joi from 'joi';
import {
  getRuleMeta,
  IValidationService,
  ValidateResult,
  ValidationOptions,
  ValidationExtendOptions,
} from '@midwayjs/validation';
import { MidwayI18nServiceSingleton, formatLocale } from '@midwayjs/i18n';

@Singleton()
export class JoiValidationService
  implements
    IValidationService<
      | Joi.ObjectSchema<any>
      | Joi.NumberSchema<any>
      | Joi.BooleanSchema<any>
      | Joi.StringSchema<any>
      | Joi.ArraySchema<any>
    >
{
  @Config('validation')
  protected validateConfig: ValidationOptions;

  @Config('i18n')
  protected i18nConfig;

  @Inject()
  protected i18nService: MidwayI18nServiceSingleton;

  public validateWithSchema(
    schema: Joi.ObjectSchema<any>,
    value: any,
    options: ValidationExtendOptions = {}
  ): ValidateResult {
    options.validateOptions = options.validateOptions || {};
    options.validateOptions.errors = options.validateOptions.errors || {};
    options.validateOptions.errors.language = formatLocale(
      this.i18nService.getAvailableLocale(
        options.validateOptions.errors.language ||
          options.locale ||
          this.i18nConfig.defaultLocale,
        'validate'
      )
    );

    const result = schema.validate(value, {
      ...options.validateOptions,
      messages: options.messages,
    });

    if (result.error) {
      return {
        status: false,
        error: result.error,
        message: result.error.message,
      };
    } else {
      return {
        status: true,
        value: result.value,
      };
    }
  }

  public getSchema(ClzType: any): Joi.ObjectSchema<any> {
    const ruleMetas = getRuleMeta(ClzType);
    return Joi.object(ruleMetas);
  }

  public getIntSchema(): Joi.NumberSchema<any> {
    return Joi.number().required();
  }

  public getBoolSchema(): Joi.BooleanSchema<any> {
    return Joi.boolean().required();
  }

  public getFloatSchema(): Joi.NumberSchema<any> {
    return Joi.number().required();
  }

  public getStringSchema(): Joi.StringSchema<any> {
    return Joi.string().required();
  }
}
