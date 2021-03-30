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
 * grpc decorator metadata format
 */
export namespace GRPCMetadata {
  export interface ProviderOptions {
    serviceName?: string;
    package?: string;
  }

  export interface ProviderMetadata {
    type: MSProviderType,
    metadata: ProviderOptions
  }
}

export namespace FaaSMetadata {

  interface TriggerCommonOptions {
    functionName?: string;
  }

  export interface EventTriggerOptions extends TriggerCommonOptions {

  }

  export interface EventTriggerMetadata {

  }

  export interface HTTPTriggerOptions extends TriggerCommonOptions  {
    path: string;
    method: string;
    middleware: any[];
  }

  export interface HTTPTriggerMetadata {

  }

  export interface APIGatewayTriggerOptions extends TriggerCommonOptions  {
    path: string;
    method: string;
    middleware: any[];
  }

  export interface APIGatewayTriggerMetadata {

  }

  export interface OSTriggerOptions extends TriggerCommonOptions  {

  }

  export interface OSTriggerMetadata {

  }

  export interface CDNTriggerOptions extends TriggerCommonOptions  {

  }

  export interface CDNTriggerMetadata {

  }

  export interface SLSTriggerOptions extends TriggerCommonOptions  {

  }

  export interface SLSTriggerMetadata {

  }

  export interface TimerTriggerOptions extends TriggerCommonOptions  {

  }

  export interface TimerTriggerMetadata {

  }

  export interface MQTriggerOptions extends TriggerCommonOptions  {

  }

  export interface MQTriggerMetadata {

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
  EMPTY = 'empty',
  LIGHT = 'light',
}

export enum ServerlessTriggerType {
  EVENT = 'event',
  HTTP = 'http',
  API_GATEWAY = 'api_gateway',
  OS = 'oss',
  CDN = 'cdn',
  SLS = 'sls',
  TIMER = 'timer',
  MQ = 'mq',
}
