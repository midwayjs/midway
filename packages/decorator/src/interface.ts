import { ScopeEnum } from './common/scopeEnum';
import { Middleware } from 'koa';
import { RequestHandler } from 'express';

export type MiddlewareParamArray = Array<Middleware | RequestHandler | string>;
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
  srcPath?: string;
}

export interface TagPropsMetadata {
  key: string | number | symbol;
  value: any;
  args?: any;
}

export interface TagClsMetadata {
  id: string;
  originName: string;
}

export interface ReflectResult {
  [key: string]: TagPropsMetadata[];
}
