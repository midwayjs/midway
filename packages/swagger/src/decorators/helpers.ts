import { DECORATORS, METADATA_FACTORY_NAME } from '../constants';

export function createMethodDecorator<T = any>(
  metakey: string,
  metadata: T
): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(metakey, metadata, descriptor.value);
    return descriptor;
  };
}

export function createClassDecorator<T extends Array<any> = any>(
  metakey: string,
  metadata: T = [] as T
): ClassDecorator {
  return (target) => {
    const prevValue = Reflect.getMetadata(metakey, target) || [];
    Reflect.defineMetadata(metakey, [...prevValue, ...metadata], target);
    return target;
  };
}

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T,
  overrideExisting = true
): PropertyDecorator {
  return (target: object, propertyKey: string) => {
    const properties =
      Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, target) || [];

    const key = `:${propertyKey}`;
    if (!properties.includes(key)) {
      Reflect.defineMetadata(
        DECORATORS.API_MODEL_PROPERTIES_ARRAY,
        [...properties, `:${propertyKey}`],
        target
      );
    }
    const existingMetadata = Reflect.getMetadata(metakey, target, propertyKey);
    if (existingMetadata) {
      const newMetadata = metadata;
      const metadataToSave = overrideExisting
        ? {
            ...existingMetadata,
            ...newMetadata
          }
        : {
            ...newMetadata,
            ...existingMetadata
          };

      Reflect.defineMetadata(metakey, metadataToSave, target, propertyKey);
    } else {
      const type =
        target?.constructor?.[METADATA_FACTORY_NAME]?.()[propertyKey]?.type ??
        Reflect.getMetadata('design:type', target, propertyKey);

      Reflect.defineMetadata(
        metakey,
        {
          type,
          ...metadata
        },
        target,
        propertyKey
      );
    }
  };
}

export function createMixedDecorator<T = any>(
  metakey: string,
  metadata: T
): MethodDecorator & ClassDecorator {
  return (
    target: object,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ): any => {
    if (descriptor) {
      Reflect.defineMetadata(metakey, metadata, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metakey, metadata, target);
    return target;
  };
}

export function createParamDecorator<T extends Record<string, any> = any>(
  metadata: T,
  initial: Partial<T>
): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const parameters =
      Reflect.getMetadata(DECORATORS.API_PARAMETERS, descriptor.value) || [];
    Reflect.defineMetadata(
      DECORATORS.API_PARAMETERS,
      [
        ...parameters,
        {
          ...initial,
          ...metadata
        }
      ],
      descriptor.value
    );
    return descriptor;
  };
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
