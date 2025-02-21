import {
  Config,
  Inject,
  Init,
  MetadataManager,
  Singleton,
  MidwayConfigService,
  MidwayCommonError,
  IMidwayContainer,
  ApplicationContext,
} from '@midwayjs/core';
import { RULES_KEY } from './constants';
import { formatLocale, I18nOptions } from '@midwayjs/i18n';
import { ValidateResult, ValidationOptions } from './interface';
import { MidwayValidationError, MidwayValidatorNotFoundError } from './error';
import { registry } from './registry';

@Singleton()
export class ValidationService {
  @Config('validation')
  protected validateConfig: ValidationOptions;

  @Config('i18n')
  protected i18nConfig: I18nOptions;

  @Inject()
  protected configService: MidwayConfigService;

  @ApplicationContext()
  protected applicationContext: IMidwayContainer;

  defaultFallbackLocale: string;

  @Init()
  protected async init() {
    // set default validator if not set
    if (this.validateConfig.defaultValidator) {
      registry.setDefaultValidator(this.validateConfig.defaultValidator);
    }

    if (!this.validateConfig.validators) {
      throw new MidwayCommonError('config.validation.validators is not set');
    }

    await registry.initValidators(this.applicationContext);
    this.defaultFallbackLocale = formatLocale(this.i18nConfig.defaultLocale);
  }

  private getValidator(name: string) {
    if (name) {
      return registry.getValidator(name);
    }
    return registry.getDefaultValidator();
  }

  public validate<T extends new (...args) => any>(
    ClzType: T,
    value: any,
    validationOptions?: ValidationOptions,
    validatorOptions?: any
  ): ValidateResult | undefined {
    const validator = this.getValidator(validationOptions?.defaultValidator);
    if (!validator) {
      throw new MidwayValidatorNotFoundError(
        validationOptions?.defaultValidator,
        500
      );
    }
    const anySchema = validator.getSchema(ClzType);
    return this.validateWithSchema(
      anySchema,
      value,
      validationOptions,
      validatorOptions
    );
  }

  public validateWithSchema<T>(
    schema: any,
    value: any,
    validationOptions?: ValidationOptions,
    validatorOptions?: any
  ): ValidateResult | undefined {
    if (!schema) {
      return;
    }

    const validator = this.getValidator(validationOptions?.defaultValidator);

    if (!validator) {
      throw new MidwayValidatorNotFoundError(
        validationOptions?.defaultValidator,
        500
      );
    }

    const res = validator.validateWithSchema(
      schema,
      value,
      {
        locale: formatLocale(validationOptions?.locale),
        fallbackLocale: this.defaultFallbackLocale,
      },
      validatorOptions
    );

    const throwValidateError =
      validationOptions?.throwValidateError ??
      this.validateConfig.throwValidateError;
    const errorStatus =
      validationOptions?.errorStatus ?? this.validateConfig.errorStatus;

    if (res.status === false && throwValidateError) {
      throw new MidwayValidationError(
        res.message || 'validation failed',
        errorStatus,
        res.error
      );
    }

    return res;
  }

  public getSchema(ClzType: any, validatorName?: string): any {
    const validator = this.getValidator(validatorName);
    return validator.getSchema(ClzType);
  }
}

export function getRuleMeta<T extends new (...args) => any>(
  ClzType: T
): { [key: string]: any } {
  const props = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
  for (const key in props) {
    if (typeof props[key] === 'function') {
      props[key] = props[key]();
    }
  }
  return props;
}
