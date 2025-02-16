import { MetadataManager } from '@midwayjs/core';
import { VALIDATE_KEY } from '../constants';
import { ValidationDecoratorOptions } from '../interface';

export function Validate(options: ValidationDecoratorOptions = {}) {
  return (target, methodName, descriptor) => {
    MetadataManager.defineMetadata(VALIDATE_KEY, options, target, methodName);
  };
}
