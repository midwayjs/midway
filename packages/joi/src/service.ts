import { Config, Inject, Singleton } from '@midwayjs/core';
import * as Joi from 'joi';
import {
  getRuleMeta,
  IValidationService,
  MidwayValidationError,
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
      | Joi.ObjectSchema<any>
    >
{
  @Config('validation')
  protected validateConfig;

  @Config('i18n')
  protected i18nConfig;

  @Inject()
  protected i18nService: MidwayI18nServiceSingleton;

  public validate(
    ClzType: any,
    value: any,
    options: ValidationExtendOptions
  ): Joi.ValidationResult<any> | undefined {
    const schema = this.getSchema(ClzType);
    return this.validateWithSchema(schema, value, options);
  }

  public validateWithSchema(
    schema: Joi.ObjectSchema<any>,
    value: any,
    options: ValidationExtendOptions = {}
  ): Joi.ValidationResult<any> | undefined {
    if (!schema) {
      return undefined;
    }

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

    const result = schema.validate(
      value,
      Object.assign(
        {},
        this.validateConfig.validationOptions ?? {},
        {
          messages: options.messages,
        },
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
