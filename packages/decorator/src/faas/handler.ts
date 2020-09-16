import { FUNC_KEY, saveModule, attachClassMetadata } from '../';
import { FuncParams } from './fun';

export function Handler(
  funHandler: string | FuncParams,
  functionOptions?: FuncParams
): MethodDecorator {
  if (typeof funHandler !== 'string' && functionOptions === undefined) {
    functionOptions = funHandler;
    funHandler = functionOptions.funHandler;
  }
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    // If target is instance, @Func annotate class member method
    saveModule(FUNC_KEY, (target as object).constructor);
    attachClassMetadata(
      FUNC_KEY,
      Object.assign(
        {
          funHandler,
          key: propertyKey,
          descriptor,
        },
        functionOptions
      ),
      target.constructor
    );
  };
}
