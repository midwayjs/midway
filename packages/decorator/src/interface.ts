import { Middleware } from 'koa';
import { RequestHandler } from 'express';

export type MiddlewareParamArray = Array<Middleware | RequestHandler | string>;
export type ObjectIdentifier = string | Symbol;

export enum ScopeEnum {
  Singleton = 'Singleton',
  Request = 'Request',
  Prototype = 'Prototype',
}

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
  uuid: string;
  name: string;
}

export interface ReflectResult {
  [key: string]: any[];
}

export enum MSProviderType {
  DUBBO = 'dubbo',
  GRPC = 'gRPC',
  HSF = 'hsf',
}

export enum MSListenerType {
  RABBITMQ = 'rabbitmq',
  MQTT = 'mqtt',
  KAFKA = 'kafka',
  REDIS = 'redis',
}

export namespace ConsumerMetadata {

  export interface ConsumerMetadata {
    type: MSListenerType,
    metadata: any;
  }
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

  export interface ServerlessFunctionOptions {
    /**
     * function name
     */
    functionName?: string;
    /**
     * function description
     */
    description?: string;
    /**
     * function memory size, unit: M
     */
    memorySize?: number;
    /**
     * function timeout value, unit: seconds
     */
    timeout?: number;
    /**
     * function init timeout, just for aliyun
     */
    initTimeout?: number;
    /**
     * function runtime, nodejs10, nodejs12, nodejs14
     */
    runtime?: string;
    /**
     * invoke concurrency, just for aliyun
     */
    concurrency?: number;
    /**
     * function invoke stage, like env, just for tencent
     */
    stage?: string;
    /**
     * environment variable, key-value
     */
    environment?: any;
    /**
     * deploy or not
     */
    isDeploy?: boolean;
  }

  interface TriggerCommonOptions {
    /**
     * function name
     */
    functionName?: string;
    /**
     * serverless event name
     */
    name?: string;
    /**
     * function invoke role, just for aliyun
     */
    role?: string;
    /**
     * function publish version, just for aliyun
     */
    version?: string;
    /**
     * deploy or not
     */
    isDeploy?: boolean;
  }

  export interface EventTriggerOptions extends TriggerCommonOptions {

  }

  export interface HTTPTriggerOptions extends TriggerCommonOptions  {
    path: string;
    method?: 'get' | 'post' | 'delete' | 'put' | 'head' | 'patch' | 'all';
    middleware?: any[];
  }

  export interface APIGatewayTriggerOptions extends HTTPTriggerOptions  {
  }

  export interface OSTriggerOptions extends TriggerCommonOptions  {
    bucket: string;
    events: string | string[];
    filter?: {
      prefix: string;
      suffix: string;
    };
  }

  export interface LogTriggerOptions extends TriggerCommonOptions  {
    source: string;
    project: string;
    log: string;
    retryTime?: number;
    interval?: number;
  }

  export interface TimerTriggerOptions extends TriggerCommonOptions  {
    type: 'cron' | 'every' | 'interval';
    value: string;
    payload?: string;
  }

  export interface MQTriggerOptions extends TriggerCommonOptions  {
    topic: string;
    tags?: string;
    region?: string;
    strategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY';
  }

  export interface HSFTriggerOptions extends TriggerCommonOptions  {
  }

  export interface MTopTriggerOptions extends TriggerCommonOptions  {
  }

  export interface CDNTriggerOptions extends TriggerCommonOptions  {
  }

  export type EventTriggerUnionOptions = EventTriggerOptions | HTTPTriggerOptions | APIGatewayTriggerOptions | OSTriggerOptions | CDNTriggerOptions | LogTriggerOptions | TimerTriggerOptions | MQTriggerOptions | HSFTriggerOptions | MTopTriggerOptions;

  export interface TriggerMetadata {
    type: ServerlessTriggerType;
    functionName?: string;
    methodName: string,
    metadata: EventTriggerUnionOptions;
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
  WS = '@midwayjs/ws',
  SERVERLESS_APP = '@midwayjs/serverless-app',
  CUSTOM = '',
  EMPTY = 'empty',
  LIGHT = 'light',
}

export enum ServerlessTriggerType {
  EVENT = 'event',
  HTTP = 'http',
  API_GATEWAY = 'apigw',
  OS = 'os',
  CDN = 'cdn',
  LOG = 'log',
  TIMER = 'timer',
  MQ = 'mq',
  HSF = 'hsf',
  MTOP = 'mtop',
}
