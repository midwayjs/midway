import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T,
  overrideExisting = true
): PropertyDecorator {
  return createPropertyDecorator(metakey, metadata, overrideExisting);
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

export function extendMetadata<T extends Record<string, any>[] = any[]>(
  metadata: T,
  metakey: string,
  target: object
) {
  const existingMetadata = Reflect.getMetadata(metakey, target);
  if (!existingMetadata) {
    return metadata;
  }
  return existingMetadata.concat(metadata);
}
