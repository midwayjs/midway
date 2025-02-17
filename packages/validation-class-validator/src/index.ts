import { IMidwayContainer, MidwayConfigService } from '@midwayjs/core';
import { IValidationService, ValidateResult, ValidationExtendOptions } from '@midwayjs/validation';
import { validateSync, ValidatorOptions } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class ClassValidatorService implements IValidationService<any> {
  private options: ValidatorOptions = {};

  async init(container: IMidwayContainer) {
    const configService = container.get(MidwayConfigService);
    this.options = configService.getConfiguration('validation')?.classValidatorOptions || {};
  }

  validateWithSchema(schema: any, value: any, validationOptions: ValidationExtendOptions, validatorOptions: ValidatorOptions = {}): ValidateResult {
    const instance = plainToInstance(schema, value);
    const errors = validateSync(instance, {
      ...this.options,
      ...validatorOptions
    });

    if (errors.length > 0) {
      const message = errors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints).join(', ');
        }
        return '';
      }).filter(Boolean).join('; ');

      return {
        status: false,
        message,
        error: errors[0]
      };
    }

    return {
      status: true,
      value: instance
    };
  }

  validate(schema: any, value: any, options?: ValidationExtendOptions): ValidateResult {
    const defaultOptions: ValidationExtendOptions = {
      locale: 'en',
      fallbackLocale: 'en'
    };
    return this.validateWithSchema(schema, value, options || defaultOptions, {});
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
  return new ClassValidatorService();
};