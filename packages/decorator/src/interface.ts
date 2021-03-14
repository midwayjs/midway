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
  value?: any;
  args?: any;
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

export enum MSProviderType {
  DUBBO = 'dubbo',
  GRPC = 'gRPC',
  HSF = 'hsf',
}

/**
 * all decorator metadata format
 */
export namespace DecoratorMetadata {

  export interface GRPCClassMetadata {
    serviceName?: string;
    package?: string;
  }

  export interface ProviderClassMetadata {
    type: MSProviderType,
    metadata: GRPCClassMetadata
  }
}

export enum MidwayFrameworkType {
  WEB = '@midwayjs/web',
  WEB_KOA = '@midwayjs/koa',
  WEB_EXPRESS = '@midwayjs/express',
  FAAS = '@midwayjs/faas',
  MS_HSF = '',
  MS_GRPC = '@midwayjs/grpc',
  MS_RABBITMQ = '@midwayjs/rabbitmq',
  WS_IO = '@midwayjs/socketio',
  WSS = '',
  SERVERLESS_APP = '@midwayjs/serverless-app',
  CUSTOM = '',
  EMPTY = '',
  LIGHT = '',
}

export enum ServerlessTriggerType {
  HTTP = 'http',
  API_GATEWAY = 'api_gateway',
  OS = 'oss',
  CDN = 'cdn',
  SLS = 'sls',
  TIMER = 'timer',
  MQ = 'scf_cmq',
}
