import { IMidwayContainer, MidwayCommonError } from '@midwayjs/core';
import { IValidator } from './interface';

class ValidatorRegistry {
  private static instance: ValidatorRegistry;
  private validators: Map<string, IValidator<any>> = new Map();
  private defaultValidator: IValidator<any>;

  static getInstance(): ValidatorRegistry {
    if (!ValidatorRegistry.instance) {
      ValidatorRegistry.instance = new ValidatorRegistry();
    }
    return ValidatorRegistry.instance;
  }

  register(name: string, validator: IValidator<any>) {
    this.validators.set(name, validator);
  }

  getValidator(name: string) {
    const validator = this.validators.get(name);
    if (!validator) {
      throw new MidwayCommonError(`No validator registered for ${name}`);
    }
    return validator;
  }

  getDefaultValidator() {
    return this.defaultValidator;
  }

  setDefaultValidator(name: string) {
    this.defaultValidator = this.getValidator(name);
  }

  setFirstValidatorToDefault() {
    this.defaultValidator = this.validators.values().next().value;
  }

  getValidatorNames() {
    return Array.from(this.validators.keys());
  }

  async initValidators(container: IMidwayContainer) {
    for (const validator of this.validators.values()) {
      validator.validateService = await validator.validateServiceHandler(
        container
      );
      await validator.validateService.init(container);
    }
  }

  clear() {
    this.validators.clear();
    this.defaultValidator = null;
  }
}

export const registry = ValidatorRegistry.getInstance();

// 导出统一的 getSchema 方法
export function getSchema(ClzType: any, validatorName?: string) {
  if (validatorName) {
    return registry.getValidator(validatorName).schemaHelper.getSchema(ClzType);
  }
  if (!registry.getDefaultValidator()) {
    throw new MidwayCommonError(
      'No default validator has been registered. Please use the "@rule(() => schema)" pattern instead.'
    );
  }
  return registry.getDefaultValidator().schemaHelper.getSchema(ClzType);
}
