import { CONTROLLER_KEY, DecoratorManager, Provide, Scope } from '../';
import { ScopeEnum, MiddlewareParamArray } from '../../interface';
import { MetadataManager } from '../metadataManager';

export interface ControllerOption {
  prefix: string;
  routerOptions?: {
    sensitive?: boolean;
    middleware?: MiddlewareParamArray;
    alias?: string[];
    description?: string;
    tagName?: string;
    ignoreGlobalPrefix?: boolean;
    // 版本控制配置
    version?: string | string[];
    versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
    versionPrefix?: string;
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
    // 版本控制配置
    version?: string | string[];
    versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
    versionPrefix?: string;
  } = { middleware: [], sensitive: true }
): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(CONTROLLER_KEY, target);
    if (prefix)
      MetadataManager.defineMetadata(
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
