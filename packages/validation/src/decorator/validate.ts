import { MetadataManager } from '@midwayjs/core';
import { VALIDATE_KEY } from '../constants';
import { ValidationOptions } from '../interface';

export function Validate(options: ValidationOptions = {}) {
  return (target, methodName, descriptor) => {
    MetadataManager.defineMetadata(VALIDATE_KEY, options, target, methodName);
  };
}
