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
   * The options to pass to the validation service.
   * It will implement in the validation service of each extension.
   */
  validateOptions?: any;
}

export interface ValidationExtendOptions extends ValidationOptions {
  /**
   * The messages to use for validation.
   * It will provide in the validation service of each extension.
   */
  messages?: any;
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
   */
  error?: any;
  /**
   * The message to validate.
   */
  message?: string;
  /**
   * The extra information to validate.
   */
  extra?: any;
}

export interface IValidationService<Schema> {
  validateWithSchema(
    schema: Schema,
    value: any,
    options: ValidationExtendOptions
  ): ValidateResult;
  getSchema(ClzType: any): any;
  getIntSchema(): Schema;
  getBoolSchema(): Schema;
  getFloatSchema(): Schema;
  getStringSchema(): Schema;
}
