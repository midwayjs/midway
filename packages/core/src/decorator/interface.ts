export type MiddlewareParamArray = Array<string | any>;
export type ObjectIdentifier = string | Symbol;
export type GroupModeType = 'one' | 'multi';

export enum ScopeEnum {
  Singleton = 'Singleton',
  Request = 'Request',
  Prototype = 'Prototype',
}

export enum InjectModeEnum {
  Identifier = 'Identifier',
  Class = 'Class',
  PropertyName = 'PropertyName',
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
  constructorArgs?: any[];
  namespace?: string;
  srcPath?: string;
  allowDowngrade?: boolean;
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
}

export enum MSListenerType {
  RABBITMQ = 'rabbitmq',
  MQTT = 'mqtt',
  KAFKA = 'kafka',
  REDIS = 'redis',
}

export namespace ConsumerMetadata {
  export interface ConsumerMetadata {
    type: MSListenerType;
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
    type: MSProviderType;
    metadata: ProviderOptions;
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
    /**
     * function handler name, like 'index.handler'
     */
    handlerName?: string;
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
    /**
     * function middleware
     */
    middleware?: any[];
  }

  export interface EventTriggerOptions extends TriggerCommonOptions {}

  export interface HTTPTriggerOptions extends TriggerCommonOptions {
    path: string;
    method?: 'get' | 'post' | 'delete' | 'put' | 'head' | 'patch' | 'all';
  }

  export interface APIGatewayTriggerOptions extends HTTPTriggerOptions {}

  export interface OSTriggerOptions extends TriggerCommonOptions {
    bucket: string;
    events: string | string[];
    filter?: {
      prefix: string;
      suffix: string;
    };
  }

  export interface LogTriggerOptions extends TriggerCommonOptions {
    source: string;
    project: string;
    log: string;
    retryTime?: number;
    interval?: number;
  }

  export interface TimerTriggerOptions extends TriggerCommonOptions {
    type: 'cron' | 'every' | 'interval';
    value: string;
    payload?: string;
    enable?: boolean;
  }

  export interface MQTriggerOptions extends TriggerCommonOptions {
    topic: string;
    tags?: string;
    region?: string;
    strategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY';
  }

  export interface HSFTriggerOptions extends TriggerCommonOptions {}

  export interface MTopTriggerOptions extends TriggerCommonOptions {}

  export interface SSRTriggerOptions extends HTTPTriggerOptions {}

  export interface CDNTriggerOptions extends TriggerCommonOptions {}

  export type EventTriggerUnionOptions =
    | EventTriggerOptions
    | HTTPTriggerOptions
    | APIGatewayTriggerOptions
    | OSTriggerOptions
    | CDNTriggerOptions
    | LogTriggerOptions
    | TimerTriggerOptions
    | MQTriggerOptions
    | HSFTriggerOptions
    | MTopTriggerOptions
    | SSRTriggerOptions;

  export interface TriggerMetadata {
    type: ServerlessTriggerType | string;
    functionName?: string;
    handlerName?: string;
    methodName?: string;
    metadata: EventTriggerUnionOptions;
  }
}

export abstract class FrameworkType {
  abstract name: string;
}

export class MidwayFrameworkType extends FrameworkType {
  static WEB = new MidwayFrameworkType('@midwayjs/web');
  static WEB_KOA = new MidwayFrameworkType('@midwayjs/web-koa');
  static WEB_EXPRESS = new MidwayFrameworkType('@midwayjs/express');
  static FAAS = new MidwayFrameworkType('@midwayjs/faas');
  static MS_GRPC = new MidwayFrameworkType('@midwayjs/grpc');
  static MS_RABBITMQ = new MidwayFrameworkType('@midwayjs/rabbitmq');
  static MS_KAFKA = new MidwayFrameworkType('@midwayjs/kafka');
  static WS_IO = new MidwayFrameworkType('@midwayjs/socketio');
  static WS = new MidwayFrameworkType('@midwayjs/ws');
  static SERVERLESS_APP = new MidwayFrameworkType('@midwayjs/serverless-app');
  static CUSTOM = new MidwayFrameworkType('');
  static EMPTY = new MidwayFrameworkType('empty');
  static LIGHT = new MidwayFrameworkType('light');
  static TASK = new MidwayFrameworkType('@midwayjs/task');
  constructor(public name: string) {
    super();
  }
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
  KAFKA = 'kafka',
  HSF = 'hsf',
  MTOP = 'mtop',
  SSR = 'ssr',
}

export interface IModuleStore {
  listModule(key: string);
  saveModule(key: string, module: any);
  transformModule?(moduleMap: Map<string, Set<any>>);
}

export interface PipeTransform<T = any, R = any> {
  transform(value: T): R;
}

export type PipeTransformFunction<T = any, R = any> = (value: T) => R;
