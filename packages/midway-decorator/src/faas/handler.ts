import { FUNC_KEY, saveModule, attachClassMetadata } from '../common';
import { FuncParams } from './fun';

export function Handler(
  funHandler: string | FuncParams,
  functionOptions?: FuncParams
): MethodDecorator {
  return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
    // If target is instance, @Func annotate class member method
    saveModule(FUNC_KEY, (target as object).constructor);
    attachClassMetadata(
      FUNC_KEY,
      Object.assign({
        funHandler,
        key: propertykey,
        descriptor,
      }, functionOptions),
      target.constructor
    );
  };
}
