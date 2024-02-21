import {
  attachClassMetadata,
  attachPropertyDataToClass,
  createCustomPropertyDecorator,
} from '@midwayjs/core';
import {
  DECORATORS,
  DECORATORS_CLASS_METADATA,
  DECORATORS_METHOD_METADATA,
} from '../constants';
import type { Type } from '../interfaces';

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T
): PropertyDecorator {
  return createCustomPropertyDecorator(metakey, metadata, false);
}

export function createMixedDecorator<T = any>(
  metakey: string,
  metadata: T
): ClassDecorator & MethodDecorator {
  return (target, methodName?: string) => {
    if (methodName) {
      attachPropertyDataToClass(
        DECORATORS_METHOD_METADATA,
        {
          key: metakey,
          propertyName: methodName,
          metadata,
        },
        target,
        methodName
      );
    } else {
      attachClassMetadata(
        DECORATORS_CLASS_METADATA,
        {
          key: metakey,
          metadata,
        },
        target
      );
    }
  };
}

export function createParamDecorator<T extends Record<string, any> = any>(
  metadata: T,
  initial: Partial<T>
): MethodDecorator {
  return createMixedDecorator(DECORATORS.API_PARAMETERS, {
    ...initial,
    ...metadata,
  });
}

export function getTypeIsArrayTuple(
  input: Type | undefined | string | Record<string, any>,
  isArrayFlag: boolean
): [Type | undefined | string | Record<string, any>, boolean] {
  if (!input) {
    return [input as undefined, isArrayFlag];
  }
  if (isArrayFlag) {
    return [input as Type, isArrayFlag];
  }
  const isInputArray = Array.isArray(input);
  const type = isInputArray ? input[0] : input;
  return [type, isInputArray];
}

export function getSchemaPath(clzz: Type | string) {
  let str = clzz;
  if (typeof clzz !== 'string') {
    str = clzz ? (clzz as any).name : clzz;
  }
  return `#/components/schemas/${str}`;
}
