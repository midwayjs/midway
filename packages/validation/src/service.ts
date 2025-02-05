import {
  Config,
  Inject,
  Init,
  MetadataManager,
  Singleton,
} from '@midwayjs/core';
import { RULES_KEY } from './constants';
import { MidwayI18nServiceSingleton, formatLocale } from '@midwayjs/i18n';
import { ValidationServiceStore } from './store';
import { ValidationOptions } from './interface';

@Singleton()
export class ValidationService {
  @Config('validation')
  protected validateConfig;

  @Config('i18n')
  protected i18nConfig;

  @Inject()
  protected i18nService: MidwayI18nServiceSingleton;

  @Inject()
  protected validationServiceStore: ValidationServiceStore<any>;

  protected messages = {};

  @Init()
  protected async init() {
    const locales = Object.keys(this.i18nConfig.localeTable);
    locales.forEach(locale => {
      this.messages[formatLocale(locale)] = Object.fromEntries(
        this.i18nService.getLocaleMapping(locale, 'validate')
      );
    });
  }

  public validate<T extends new (...args) => any>(
    ClzType: T,
    value: any,
    options: ValidationOptions = {}
  ): any | undefined {
    return this.validationServiceStore
      .getValidationService()
      .validate(ClzType, value, {
        ...options,
        messages: this.messages,
      });
  }

  public validateWithSchema<T>(
    schema: any,
    value: any,
    options: ValidationOptions = {}
  ): any | undefined {
    return this.validationServiceStore
      .getValidationService()
      .validateWithSchema(schema, value, {
        ...options,
        messages: this.messages,
      });
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
