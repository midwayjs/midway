import { Scope } from '../annotation';
import {
  ScopeEnum,
  saveModule,
  FUNC_KEY,
  attachClassMetadata,
  MiddlewareParamArray,
  ServerlessTriggerType,
} from '..';

export interface FuncParams {
  funHandler?: string;
  event?: string;
  method?: string;
  path?: string;
  middleware?: MiddlewareParamArray;
}



export function Func(type: ServerlessTriggerType, metadata: {}): MethodDecorator;
export function Func(
  funHandler: string | FuncParams,
  functionOptions?: FuncParams
): any {
  if (typeof funHandler !== 'string' && functionOptions === undefined) {
    functionOptions = funHandler;
    funHandler = functionOptions.funHandler || '';
  }
  return (...args) => {
    const [target, key, descriptor] = args as any;
    // If target is function, @Func annotate class
    if (typeof target === 'function') {
      // save target
      saveModule(FUNC_KEY, target);
      attachClassMetadata(
        FUNC_KEY,
        Object.assign({ funHandler }, functionOptions),
        target
      );
      // register data
      Scope(ScopeEnum.Request)(target);
    } else {
      // If target is instance, @Func annotate class member method
      saveModule(FUNC_KEY, (target as Record<string, unknown>).constructor);
      attachClassMetadata(
        FUNC_KEY,
        Object.assign(
          {
            funHandler,
            key,
            descriptor,
          },
          functionOptions
        ),
        target.constructor
      );
    }
  };
}
