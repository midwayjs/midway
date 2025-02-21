import { IMidwayContainer, MidwayConfigService } from '@midwayjs/core';
import {
  IValidationService,
  ValidateResult,
  ValidationExtendOptions,
} from '@midwayjs/validation';
import { plainToInstance } from 'class-transformer';
import {
  validateSync,
  ValidatorOptions,
} from 'class-validator-multi-lang-lite';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n/dist';

const EN_I18N_MESSAGES = require('../i18n/en.json');
const ZH_I18N_MESSAGES = require('../i18n/zh.json');
const localeMapping = new Map();

export class ClassValidatorService implements IValidationService<any> {
  protected defaultClassValidatorOptions: ValidatorOptions;

  async init(container: IMidwayContainer) {
    const i18nServiceSingleton = await container.getAsync(
      MidwayI18nServiceSingleton
    );
    const configService = await container.getAsync(MidwayConfigService);
    this.defaultClassValidatorOptions =
      configService.getConfiguration('classValidator');

    for (const locale of i18nServiceSingleton.getLocaleList('classValidator')) {
      localeMapping.set(
        locale,
        i18nServiceSingleton.getOriginLocaleJSON(locale, 'classValidator')
      );
    }
  }

  validateWithSchema(
    schema: any,
    value: any,
    validationOptions: ValidationExtendOptions,
    validatorOptions: ValidatorOptions = {}
  ): ValidateResult {
    const instance = plainToInstance(schema, value);

    // get locale from options or fallback to default
    const locale = localeMapping.has(validationOptions.locale)
      ? validationOptions.locale
      : localeMapping.has(validationOptions.fallbackLocale)
      ? validationOptions.fallbackLocale
      : 'en-us';

    const errors = validateSync(instance, {
      ...this.defaultClassValidatorOptions,
      ...validatorOptions,
      messages: localeMapping.get(locale),
    });

    if (errors.length > 0) {
      const messages = errors
        .map(error => {
          if (error.constraints) {
            return Object.values(error.constraints).join(', ');
          }
          return '';
        })
        .filter(Boolean);

      return {
        status: false,
        message: messages[0],
        messages,
        error: errors[0],
        errors,
      };
    }

    return {
      status: true,
      value: instance,
    };
  }

  getSchema(schema: any) {
    return schema;
  }

  public getIntSchema(): any {
    return Number;
  }

  public getBoolSchema(): any {
    return Boolean;
  }

  public getFloatSchema(): any {
    return Number;
  }

  public getStringSchema(): any {
    return String;
  }
}

export default async (container: IMidwayContainer) => {
  const configService = container.get(MidwayConfigService);
  configService.addObject({
    i18n: {
      localeTable: {
        en_US: {
          classValidator: EN_I18N_MESSAGES,
        },
        zh_CN: {
          classValidator: ZH_I18N_MESSAGES,
        },
      },
    },
  });
  return new ClassValidatorService();
};
