import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  WS_CONTROLLER_KEY,
  Provide,
  Scope,
  MiddlewareParamArray,
} from '../';

export interface WSControllerOption {
  namespace: string;
  routerOptions: {
    connectionMiddleware?: MiddlewareParamArray;
    middleware?: MiddlewareParamArray;
  };
}

export function WSController(
  namespace: string | RegExp = '/',
  routerOptions: WSControllerOption['routerOptions'] = {
    middleware: [],
    connectionMiddleware: [],
  }
): ClassDecorator {
  return (target: any) => {
    saveModule(WS_CONTROLLER_KEY, target);
    saveClassMetadata(
      WS_CONTROLLER_KEY,
      {
        namespace,
        routerOptions,
      } as WSControllerOption,
      target
    );
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
