import { Scope } from '../annotation';
import {
  ScopeEnum,
  saveModule,
  FUNC_KEY,
  attachClassMetadata,
  MiddlewareParamArray,
  WEB_ROUTER_KEY,
  RouterOption,
} from '..';

export interface FuncParams {
  funHandler?: string;
  event?: string;
  method?: string;
  path?: string;
  middleware?: MiddlewareParamArray;
}

export function Func(
  funHandler: string | FuncParams,
  functionOptions?: FuncParams
) {
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

      // support run in 2.0
      if (functionOptions) {
        attachClassMetadata(
          WEB_ROUTER_KEY,
          {
            path: functionOptions.path,
            requestMethod: functionOptions.method,
            routerName: '',
            method: key,
            middleware: functionOptions.middleware,
          } as RouterOption,
          target
        );
      }
    }
  };
}
