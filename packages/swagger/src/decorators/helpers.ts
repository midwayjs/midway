import { createCustomMethodDecorator, createCustomPropertyDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T,
  overrideExisting = true
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
    ...metadata
  });
}

export function getTypeIsArrayTuple(
  input: Function | [Function] | undefined | string | Record<string, any>,
  isArrayFlag: boolean
): [Function | undefined | string | Record<string, any>, boolean] {
  if (!input) {
    return [input as undefined, isArrayFlag];
  }
  if (isArrayFlag) {
    return [input as Function, isArrayFlag];
  }
  const isInputArray = Array.isArray(input);
  const type = isInputArray ? input[0] : input;
  return [type, isInputArray];
}
