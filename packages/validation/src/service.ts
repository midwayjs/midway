import {
  Config,
  Inject,
  Init,
  MetadataManager,
  Singleton,
  extend,
} from '@midwayjs/core';
import { RULES_KEY } from './constants';
import {
  MidwayI18nServiceSingleton,
  formatLocale,
  I18nOptions,
} from '@midwayjs/i18n';
import { ValidationServiceStore } from './store';
import { ValidateResult, ValidationOptions } from './interface';
import { MidwayValidationError } from './error';

@Singleton()
export class ValidationService {
  @Config('validation')
  protected validateConfig: ValidationOptions;

  @Config('i18n')
  protected i18nConfig: I18nOptions;

  @Inject()
  protected i18nService: MidwayI18nServiceSingleton;

  @Inject()
  protected validationServiceStore: ValidationServiceStore<any>;

  protected messages = {};

  @Init()
  protected async init() {
    const locales = Object.keys(this.i18nConfig.localeTable);
    locales.forEach(locale => {
      const mapping = this.i18nService.getLocaleMapping(locale, 'validate');
      this.messages[formatLocale(locale)] = Object.fromEntries(mapping ?? []);
    });
  }

  public validate<T extends new (...args) => any>(
    ClzType: T,
    value: any,
    options: ValidationOptions = {}
  ): ValidateResult | undefined {
    const anySchema = this.validationServiceStore
      .getValidationService()
      .getSchema(ClzType);
    return this.validateWithSchema(anySchema, value, options);
  }

  public validateWithSchema<T>(
    schema: any,
    value: any,
    options: ValidationOptions = {}
  ): ValidateResult | undefined {
    if (!schema) {
      return;
    }

    const newOptions = extend({}, this.validateConfig, options, {
      messages: this.messages,
    });

    const res = this.validationServiceStore
      .getValidationService()
      .validateWithSchema(schema, value, newOptions);

    if (res.status === false && newOptions.throwValidateError) {
      throw new MidwayValidationError(
        res.message ?? 'validation failed',
        newOptions.errorStatus || 422,
        res.error
      );
    }

    return res;
  }

  public getSchema(ClzType: any): any {
    return this.validationServiceStore
      .getValidationService()
      .getSchema(ClzType);
  }
}

export function getRuleMeta<T extends new (...args) => any>(
  ClzType: T
): { [key: string]: any } {
  return MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
}
