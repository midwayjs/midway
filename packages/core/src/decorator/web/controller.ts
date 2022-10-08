import {
  saveClassMetadata,
  saveModule,
  CONTROLLER_KEY,
  Provide,
  Scope,
  MiddlewareParamArray,
  ScopeEnum,
} from '../';

export interface ControllerOption {
  prefix: string;
  routerOptions?: {
    sensitive?: boolean;
    middleware?: MiddlewareParamArray;
    alias?: string[];
    description?: string;
    tagName?: string;
    ignoreGlobalPrefix?: boolean;
  };
}

export function Controller(
  prefix = '/',
  routerOptions: {
    sensitive?: boolean;
    middleware?: MiddlewareParamArray;
    description?: string;
    tagName?: string;
    ignoreGlobalPrefix?: boolean;
  } = { middleware: [], sensitive: true }
): ClassDecorator {
  return (target: any) => {
    saveModule(CONTROLLER_KEY, target);
    if (prefix)
      saveClassMetadata(
        CONTROLLER_KEY,
        {
          prefix,
          routerOptions,
        } as ControllerOption,
        target
      );
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
