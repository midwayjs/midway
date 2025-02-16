import { IMidwayContainer, MidwayConfigService } from '@midwayjs/core';
import * as Joi from 'joi';
import {
  getRuleMeta,
  ValidateResult,
  ValidationExtendOptions,
  IValidationService
} from '@midwayjs/validation';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n';

const localeMapping = new Map();

export default (container: IMidwayContainer) => {
  const configService = container.get(MidwayConfigService);

  configService.addObject({
    i18n: {
      localeTable: {
        en_US: {
          joi: require('../locales/en_US.json'),
        },
        zh_CN: {
          joi: require('../locales/zh_CN.json'),
        },
      },
    }
  });

  return new class implements IValidationService<any> {
    async init() {
      const i18nServiceSingleton = await container.getAsync(MidwayI18nServiceSingleton);
      for (const locale of i18nServiceSingleton.getLocaleList('joi')) {
        localeMapping.set(locale, i18nServiceSingleton.getOriginLocaleJSON(locale, 'joi'));
      }
    }
    public validateWithSchema(
      schema: Joi.ObjectSchema<any>,
      value: any,
      options: ValidationExtendOptions,
      validatorOptions: any = {}
    ): ValidateResult {
      const locale = options.locale;
      validatorOptions.errors = validatorOptions.errors || {};
      validatorOptions.errors.language = locale;
      validatorOptions.messages = localeMapping.get(locale);
      const result = schema.validate(value, validatorOptions);

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
  };
}
