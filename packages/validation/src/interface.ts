export interface ValidationOptions {
  errorStatus?: number;
  locale?: string;
  validateOptions?: any;
}

export interface ValidationExtendOptions extends ValidationOptions {
  messages?: any;
}

export interface IValidationService<Schema> {
  validate(
    ClzType: any, 
    value: any,
    options: ValidationExtendOptions
  ): any;
  validateWithSchema(
    schema: Schema,
    value: any, 
    options: ValidationExtendOptions
  ): any;
  getSchema(ClzType: any): any;
  getIntSchema(): Schema;
  getBoolSchema(): Schema;
  getFloatSchema(): Schema;
  getStringSchema(): Schema;
}