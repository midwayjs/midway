import { saveClassMetadata } from '@midwayjs/core';
import { DECORATORS } from '../constants';

export function ApiExcludeController(disable = true): ClassDecorator {
  return (target: any) => {
    saveClassMetadata(DECORATORS.API_EXCLUDE_CONTROLLER, { disable }, target);
  };
}
