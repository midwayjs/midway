import { MetadataManager } from '@midwayjs/core';
import { DECORATORS } from '../constants';

export function ApiExcludeController(disable = true): ClassDecorator {
  return (target: any) => {
    MetadataManager.defineMetadata(
      DECORATORS.API_EXCLUDE_CONTROLLER,
      { disable },
      target
    );
  };
}
