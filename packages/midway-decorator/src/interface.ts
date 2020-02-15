import { ScopeEnum } from './common';

export type KoaMiddleware <T = any> = (context: T, next: () => Promise<any>) => void;
export type KoaMiddlewareParamArray <T = any> = Array<string | KoaMiddleware<T>>;
export type ObjectIdentifier = string;

/**
 * 内部管理的属性、json、ref等解析实例存储
 */
export interface IManagedInstance {
  type: string;
}
export interface ObjectDefinitionOptions {
  isAsync?: boolean;
  initMethod?: string;
  destroyMethod?: string;
  scope?: ScopeEnum;
  constructorArgs?: IManagedInstance[];
  // 是否自动装配
  isAutowire?: boolean;
  namespace?: string;
}

export interface TagPropsMetadata {
  key: string | number | symbol;
  value: any;
}

export interface TagClsMetadata {
  id: string;
  originName: string;
}

export interface ReflectResult {
  [key: string]: TagPropsMetadata[];
}
