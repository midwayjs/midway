import { attachClassMetadata, attachPropertyDataToClass } from '@midwayjs/core';
import { DECORATORS, DECORATORS_CLASS_METADATA, DECORATORS_METHOD_METADATA } from '../constants';
import { SecurityRequirementObject } from '../interfaces';

export function ApiSecurity(
  name: string | SecurityRequirementObject,
  requirements: string[] = []
): ClassDecorator {
  return target => {
    let metadata: SecurityRequirementObject;

    if (typeof name === 'string') {
      metadata = { [name]: requirements || [] };
    } else {
      metadata = name;
    }

    attachClassMetadata(
      DECORATORS_CLASS_METADATA,
      {
        key: DECORATORS.API_SECURITY,
        metadata,
      },
      target
    );
  };
}

export function ApiExcludeSecurity(): MethodDecorator {
  return (target, methodName) => {
    attachPropertyDataToClass(
      DECORATORS_METHOD_METADATA,
      {
        key: DECORATORS.API_EXCLUDE_SECURITY,
        metadata: true,
      },
      target,
      methodName
    );
  };
}
