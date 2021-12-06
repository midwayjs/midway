import { DECORATORS } from '../constants';

export function ApiExtraModels(...models: Function[]) {
  return (
    target: object,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ): any => {
    if (descriptor) {
      const extraModels = Reflect.getMetadata(DECORATORS.API_EXTRA_MODELS, descriptor.value) || [];
      Reflect.defineMetadata(
        DECORATORS.API_EXTRA_MODELS,
        [...extraModels, ...models],
        descriptor.value
      );
      return descriptor;
    }

    const extraModels = Reflect.getMetadata(DECORATORS.API_EXTRA_MODELS, target) || [];
    Reflect.defineMetadata(
      DECORATORS.API_EXTRA_MODELS,
      [...extraModels, ...models],
      target
    );
    return target;
  };
}
