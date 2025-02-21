import { IMidwayContainer } from "@midwayjs/core";

export interface ValidationOptions {
  /**
   * The status code to return when validation fails, default is 422.
   */
  errorStatus?: number;
  /**
   * Whether to throw a validation error, default is true.
   * If set to false, the validation error will be returned.
   */
  throwValidateError?: boolean;
  /**
   * The locale to use for validation messages.
   */
  locale?: string;
  /**
   * The validators to use for validation.
   */
  validators?: Record<string, (container: IMidwayContainer) => Promise<IValidationService<any>>>;
  /**
   * The default validator to use for validation.
   */
  defaultValidator?: string;
}

export interface ValidationDecoratorOptions extends ValidationOptions {
  validatorOptions?: any;
}

export interface ValidationExtendOptions {
  /**
   * The locale to use for validation messages.
   */
  locale: string;
  /**
   * The fallback locale to use for validation messages.
   */
  fallbackLocale: string;
}

export interface ValidateResult {
  /**
   * Whether the validation is successful.
   */
  status: boolean;
  /**
   * If the validation is successful, the value will be returned.
   */
  value?: any;
  /**
   * If the validation fails, the error or the message will be returned.
   * if has multiple errors, the first error will be used.
   */
  error?: any;
  /**
   * The errors to validate.
   */
  errors?: any[];
  /**
   * The message to validate.
   * if has multiple messages, the first message will be used.
   */
  message?: string;
  /**
   * The messages to validate.
   */
  messages?: string[];
  /**
   * The extra information to validate.
   */
  extra?: any;
}

export interface IValidationService<Schema> {
  init(container: IMidwayContainer): Promise<void>;
  validateWithSchema(
    schema: Schema,
    value: any,
    validationOptions: ValidationExtendOptions,
    validatorOptions: any
  ): ValidateResult;
  getSchema(ClzType: any): any;
  getIntSchema(): Schema;
  getBoolSchema(): Schema;
  getFloatSchema(): Schema;
  getStringSchema(): Schema;
}
