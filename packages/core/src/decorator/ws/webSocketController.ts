import { WS_CONTROLLER_KEY, Provide, Scope, DecoratorManager } from '../';
import { ScopeEnum, MiddlewareParamArray } from '../../interface';
import { MetadataManager } from '../metadataManager';

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
    DecoratorManager.saveModule(WS_CONTROLLER_KEY, target);
    MetadataManager.defineMetadata(
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
