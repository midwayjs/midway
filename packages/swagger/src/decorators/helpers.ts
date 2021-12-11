import {
  createCustomMethodDecorator,
  createCustomPropertyDecorator,
} from '@midwayjs/decorator';
import { DECORATORS } from '../constants';
import type { Type } from '../interfaces';

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T
): PropertyDecorator {
  return createCustomPropertyDecorator(metakey, metadata);
}

export function createMixedDecorator<T = any>(
  metakey: string,
  metadata: T
): any {
  return createCustomMethodDecorator(metakey, metadata);
}

export function createParamDecorator<T extends Record<string, any> = any>(
  metadata: T,
  initial: Partial<T>
): MethodDecorator {
  return createCustomMethodDecorator(DECORATORS.API_PARAMETERS, {
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
  if (typeof clzz === 'object') {
    str = clzz ? (clzz as any).name : clzz;
  }
  return `#/components/schemas/${str}`;
}
