import type { AsyncContextManager } from './common/asyncContextManager';
import type { LoggerFactory } from './common/loggerFactory';
import type { ManagedResolverFactory } from './context/managedResolverFactory';
import type { EventEmitter } from 'events';
import type { FunctionalConfiguration } from './functional';

export type ClassType<T = any> = new (...args: any[]) => T;

export type PowerPartial<T> = {
  [U in keyof T]?: T[U] extends {} ? PowerPartial<T[U]> : T[U];
};

/**
 * Make object property writeable
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Utility type that adds a `fn` parameter to each method in the input type `T`,
 * transforming the original method's parameter types and return type into a function type.
 *
 * @example
 * // Input:
 * interface MyInterface {
 *   method1(a: string, b: number): boolean;
 *   method2(x: Foo, y: Bar): void;
 * }
 *
 * // Output:
 * interface MyInterfaceWithFn {
 *   method1(fn: (a: string, b: number) => boolean): void;
 *   method2(fn: (x: Foo, y: Bar) => void): void;
 * }
 */
export type WithFn<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (fn: (...args: P) => R) => void
    : T[K];
};

/**
 * Transform an object type `T` with methods that have function-type parameters
 * to a new object type with the same methods, but with the parameters
 * extracted as separate properties.
 */
export type WithoutFn<T> = {
  [K in keyof T]: T[K] extends (arg: any, ...args: any[]) => any
    ? (...args: Parameters<T[K]>) => ReturnType<T[K]>
    : T[K];
};

export type MiddlewareParamArray = Array<string | any>;
export type ObjectIdentifier = string | Symbol;

export enum ScopeEnum {
  Singleton = 'Singleton',
  Request = 'Request',
  Prototype = 'Prototype',
}

export enum InjectModeEnum {
  Identifier = 'Identifier',
  Class = 'Class',
  SelfName = 'SelfName',
}

/**
 * Metadata when using @Inject property injection
 */
export interface PropertyInjectMetadata {
  args: any[];
  id: ObjectIdentifier | (() => ObjectIdentifier | ClassType);
  name: string;
  injectMode: InjectModeEnum;
  targetKey: string;
  isLazyInject: boolean;
}

/**
 * Metadata when using @Inject constructor injection
 */
export interface ConstructorInjectMetadata extends PropertyInjectMetadata {
  parameterIndex: number;
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

export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed?(...args: any[]): any;
  proceedIsAsyncFunction?: boolean;
}

export interface AspectMetadata {
  aspectTarget: any;
  match?: string | (() => boolean);
  priority?: number;
}

export interface IMethodAspect {
  after?(joinPoint: JoinPoint, result: any, error: Error);
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}

export interface TSDesignType<OriginType = unknown> {
  name: string;
  originDesign: OriginType;
  isBaseType: boolean;
}

export interface TransformOptions<OriginType = unknown> {
  metaType: TSDesignType<OriginType>;
  metadata: any;
  /**
   * current instance
   */
  target: any;
  /**
   * the name of method
   */
  methodName: string;
}

export interface PipeTransform<T = unknown, R = unknown> {
  transform(value: T, transformOptions: TransformOptions): R;
}

export type PipeTransformFunction<T = any, R = any> = (value: T) => R;

export type PipeUnionTransform<T = any, R = any> = PipeTransform<T, R> | (new (...args) => PipeTransform<T, R>) | PipeTransformFunction<T, R>;

export interface PropertyDecoratorOptions {
  impl?: boolean;
  allowMulti?: boolean;
}

export interface MethodDecoratorMetaData<Metadata = any> {
  propertyName: string;
  /** decorator key */
  key: string;
  metadata: Metadata;
  options: MethodDecoratorOptions | undefined;
}

export interface MethodDecoratorOptions {
  impl?: boolean;
}

export interface ParameterDecoratorMetaData<Metadata = any> {
  key: string;
  parameterIndex: number;
  propertyName: string;
  metadata: Metadata;
  options: ParamDecoratorOptions | undefined;
}

export interface ParamDecoratorOptions {
  impl?: boolean;
  throwError?: boolean;
  pipes?: PipeUnionTransform<any, any>[];
}

/**
 * Logger Options for midway, you can merge this interface in package
 * @example
 * ```typescript
 *
 * import { IMidwayLogger } from '@midwayjs/logger';
 *
 * declare module '@midwayjs/core/dist/interface' {
 *   interface ILogger extends IMidwayLogger {
 *   }
 * }
 *
 * ```
 */
export interface ILogger {
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
}

/**
 * Logger Options for midway, you can merge this interface in package
 * @example
 * ```typescript
 *
 * import { LoggerOptions } from '@midwayjs/logger';
 *
 * declare module '@midwayjs/core/dist/interface' {
 *   interface MidwayLoggerOptions extends LoggerOptions {
 *     logDir?: string;
 *     level?: string;
 *   }
 * }
 *
 * ```
 */
export interface MidwayLoggerOptions {
  lazyLoad?: boolean;
  aliasName?: string;
  [key: string]: any;
}

export interface MidwayCoreDefaultConfig {
  midwayLogger?: ServiceFactoryConfigOption<MidwayLoggerOptions>;
  debug?: {
    recordConfigMergeOrder?: boolean;
  };
  asyncContextManager?: {
    enable?: boolean;
  };
  core?: {
    healthCheckTimeout?: number;
    configLoadTimeout?: number;
    readyTimeout?: number;
    serverReadyTimeout?: number;
    stopTimeout?: number;
  }
}

export type ServiceFactoryConfigOption<OPTIONS> = {
  default?: PowerPartial<OPTIONS>;
  client?: PowerPartial<OPTIONS>;
  clients?: {
    [key: string]: PowerPartial<OPTIONS>;
  };
  defaultClientName?: string;
  clientPriority?: {
    [key: string]: number;
  }
};

export type CreateDataSourceInstanceOptions = {
  /**
   * @deprecated
   */
  validateConnection?: boolean;
  /**
   * @deprecated
   */
  cacheInstance?: boolean | undefined;
}

export type BaseDataSourceManagerConfigOption<OPTIONS extends Record<string, any>, ENTITY_CONFIG_KEY extends string = 'entities'> = OPTIONS & {
  validateConnection?: boolean;
  customDataSourceClass?: any;
} & {
  [key in ENTITY_CONFIG_KEY]?: any[];
};

export interface DataSourceManagerConfigOption<OPTIONS extends Record<string, any>, ENTITY_CONFIG_KEY extends string = 'entities'> extends CreateDataSourceInstanceOptions {
  default?: BaseDataSourceManagerConfigOption<OPTIONS, ENTITY_CONFIG_KEY>;
  defaultDataSourceName?: string;
  dataSource?: BaseDataSourceManagerConfigOption<OPTIONS, ENTITY_CONFIG_KEY>;
}

type ConfigType<T> = T extends (...args: any[]) => any
  ? Writable<PowerPartial<ReturnType<T>>>
  : Writable<PowerPartial<T>>;

/**
 * Get definition from config
 */
export type FileConfigOption<T, K = unknown> = K extends keyof ConfigType<T>
  ? Pick<ConfigType<T>, K>
  : ConfigType<T>;


export interface LifeCycleInvokeOptions {
  abortController: AbortController;
  timeout: number;
}

/**
 * Lifecycle Definition
 * 生命周期定义
 */
export interface ILifeCycle extends Partial<IObjectLifeCycle> {
  onConfigLoad?(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<any>;
  onReady?(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<void>;
  onServerReady?(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<void>;
  onHealthCheck?(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<HealthResult>;
  onStop?(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<void>;
}

/**
 * Abstract Object Factory
 * 对象容器抽象
 */
export interface IObjectFactory {
  registry: IObjectDefinitionRegistry;
  get<T>(
    identifier: ClassType<T> | string,
    args?: any[]
  ): T;
  getAsync<T>(
    identifier: ClassType<T> | string,
    args?: any[]
  ): Promise<T>;
}

export enum ObjectLifeCycleEvent {
  BEFORE_BIND = 'beforeBind',
  BEFORE_CREATED = 'beforeObjectCreated',
  AFTER_CREATED = 'afterObjectCreated',
  AFTER_INIT = 'afterObjectInit',
  BEFORE_DESTROY = 'beforeObjectDestroy',
}

interface ObjectLifeCycleOptions {
  context: IMidwayContainer;
  definition: IObjectDefinition;
}

export interface ObjectBeforeBindOptions extends ObjectLifeCycleOptions {
  replaceCallback: (newDefinition: IObjectDefinition) => void;
}

export interface ObjectBeforeCreatedOptions extends ObjectLifeCycleOptions {
  constructorArgs: any[];
}

export interface ObjectCreatedOptions<T> extends ObjectLifeCycleOptions {
  replaceCallback: (ins: T) => void;
}

export interface ObjectInitOptions extends ObjectLifeCycleOptions {}

export interface ObjectBeforeDestroyOptions extends ObjectLifeCycleOptions {}

/**
 * Object Lifecycle
 * 对象生命周期
 */
export interface IObjectLifeCycle {
  onBeforeBind(Clzz: any, options: ObjectBeforeBindOptions): void;
  onBeforeObjectCreated(Clzz: any, options: ObjectBeforeCreatedOptions): void;
  onObjectCreated<T>(ins: T, options: ObjectCreatedOptions<T>): void;
  onObjectInit<T>(ins: T, options: ObjectInitOptions): void;
  onBeforeObjectDestroy<T>(ins: T, options: ObjectBeforeDestroyOptions): void;
}

/**
 * Object Definition
 * 对象描述定义
 */
export interface IObjectDefinition {
  namespace?: string;
  creator: IObjectCreator;
  id: string;
  name: string;
  initMethod: string;
  destroyMethod: string;
  constructMethod: string;
  srcPath: string;
  path: any;
  export: string;
  dependsOn: ObjectIdentifier[];
  constructorArgs: ConstructorInjectMetadata[];
  properties: Map<string, PropertyInjectMetadata>;
  scope: ScopeEnum;
  isAsync(): boolean;
  isSingletonScope(): boolean;
  isRequestScope(): boolean;
  hasDependsOn(): boolean;
  hasConstructorArgs(): boolean;
  getAttr(key: ObjectIdentifier): any;
  hasAttr(key: ObjectIdentifier): boolean;
  setAttr(key: ObjectIdentifier, value: any): void;
  // 自定义装饰器的 key、propertyName
  handlerProps: Array<{
    /**
     * decorator property name set
     */
    propertyName: string;
    /**
     * decorator uuid key
     */
    key: string;
    /**
     * custom decorator set metadata
     */
    metadata: any;
  }>;
  createFrom: 'framework' | 'file' | 'module';
  allowDowngrade: boolean;
  bindHook?: (module: any, options?: IObjectDefinition) => void;
}

export interface IObjectCreator {
  type: string;
  load(): any;
  doConstruct(Clzz: any, args?: any[]): any;
  doInit(obj: any, context: IMidwayContainer): any;
  doInitAsync(obj: any, context: IMidwayContainer): Promise<any>;
  doDestroy(obj: any): void;
  doDestroyAsync(obj: any): Promise<void>;
}
/**
 * Object Definition Registry
 * 对象定义存储容器
 */
export interface IObjectDefinitionRegistry {
  readonly identifiers: ObjectIdentifier[];
  readonly count: number;
  registerDefinition(
    identifier: ObjectIdentifier,
    definition: IObjectDefinition
  );
  getSingletonDefinitionIds(): ObjectIdentifier[];
  getDefinition(identifier: ObjectIdentifier): IObjectDefinition;
  getDefinitionByName(name: string): IObjectDefinition[];
  removeDefinition(identifier: ObjectIdentifier): void;
  hasDefinition(identifier: ObjectIdentifier): boolean;
  clearAll(): void;
  hasObject(identifier: ObjectIdentifier): boolean;
  registerObject(identifier: ObjectIdentifier, target: any);
  removeObject(identifier: ObjectIdentifier): void;
  getObject(identifier: ObjectIdentifier): any;
  getIdentifierRelation(): IIdentifierRelationShip;
  setIdentifierRelation(identifierRelation: IIdentifierRelationShip);
}

export type HandlerFunction = (
  /**
   * decorator uuid key
   */
  key: string,
  /**
   * decorator set metadata
   */
  meta: any,
  instance: any
) => any;

export type MethodHandlerFunction = (options: {
  target: new (...args) => any;
  propertyName: string;
  metadata: any;
}) => IMethodAspect;

export type ParameterHandlerFunction = (options: {
  target: new (...args) => any;
  propertyName: string;
  metadata: any;
  originArgs: Array<any>;
  originParamType: any;
  parameterIndex: number;
}) => any;

export interface IIdentifierRelationShip {
  saveClassRelation(module: any, namespace?: string): void;
  saveFunctionRelation(id: ObjectIdentifier, uuid: string): void;
  hasRelation(id: ObjectIdentifier): boolean;
  getRelation(id: ObjectIdentifier): string;
}

export interface IMidwayGlobalContainer extends IMidwayContainer, WithFn<IObjectLifeCycle> {
  identifierMapping: IIdentifierRelationShip;
  objectCreateEventTarget: EventEmitter;
  getNamespaceList(): string[];
  addNamespace(namespace: string): void;
  bind<T>(target: T, options?: Partial<IObjectDefinition>): IObjectDefinition | undefined;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: Partial<IObjectDefinition>
  ): IObjectDefinition | undefined;
  bindClass(exports, options?: Partial<IObjectDefinition>): void;
  stop(): Promise<void>;
  getManagedResolverFactory(): ManagedResolverFactory;
}

export interface IMidwayRequestContainer extends IMidwayContainer {
  parent: IMidwayContainer;
  getContext(): IMidwayContext;
}

export interface IMidwayContainer extends IObjectFactory {
  registerObject(identifier: ObjectIdentifier, target: any): void;
  hasDefinition(identifier: ObjectIdentifier): boolean;
  getDefinition(identifier: ObjectIdentifier): IObjectDefinition;
  hasObject(identifier: ObjectIdentifier): boolean;
  getObject<T>(identifier: ObjectIdentifier): T;
  removeObject(identifier: ObjectIdentifier): void;
  /**
   * Set value to app attribute map
   * @param key
   * @param value
   */
  setAttr(key: string, value: any): void;
  /**
   * Get value from app attribute map
   * @param key
   */
  getAttr<T>(key: string): T;
  /**
   * Get IoC identifier
   */
  getIdentifier(identifier: (ClassType | string)): string;
  /**
   * Get instance IoC container scope
   * @param instance
   */
  getInstanceScope(instance: any): ScopeEnum | undefined;
  hasNamespace(namespace: string): boolean;
}

export interface IFileDetector {
  run(container: IMidwayGlobalContainer, namespace: string): Promise<void>;
  runSync(container: IMidwayGlobalContainer, namespace: string): void;
}

export interface IConfigService {
  add(configFilePaths: any[]);
  addObject(obj: object, reverse?: boolean);
  load();
  getConfiguration(configKey?: string);
  clearAllConfig();
}

export interface IInformationService {
  getPkg(): any;
  getProjectName(): any;
  getBaseDir(): string;
  getAppDir(): string;
  getHome(): string;
  getRoot(): string;
}

export interface IEnvironmentService {
  getCurrentEnvironment(): string;
  isDevelopmentEnvironment(): boolean;
  getModuleLoadType(): ModuleLoadType;
}

export enum MidwayProcessTypeEnum {
  APPLICATION = 'APPLICATION',
  AGENT = 'AGENT',
}

export interface Context {
  /**
   * Custom properties.
   */
  requestContext: IMidwayContainer;
  logger: ILogger;
  getLogger(name?: string): ILogger;
  startTime: number;
  /**
   * Set value to app attribute map
   * @param key
   * @param value
   */
  setAttr(key: string, value: any);
  /**
   * Get value from app attribute map
   * @param key
   */
  getAttr<T>(key: string): T;
  /**
   * Get current related application instance.
   */
  getApp(): IMidwayApplication;
}

export type IMidwayContext<FrameworkContext = unknown> = Context &
  FrameworkContext;
export type NextFunction = () => Promise<any>;

export type IgnoreMatcher<CTX> = string | RegExp | ((ctx: CTX) => boolean);

/**
 * Common middleware definition
 */
export interface IMiddleware<CTX, R, N = unknown> {
  resolve: (app: IMidwayApplication, options?: any) => FunctionMiddleware<CTX, R, N> | Promise<FunctionMiddleware<CTX, R, N>>;
  /**
   * Which paths to ignore
   */
  match?: IgnoreMatcher<CTX> | IgnoreMatcher<CTX> [];
  /**
   * Match those paths with higher priority than ignore
   */
  ignore?: IgnoreMatcher<CTX> | IgnoreMatcher<CTX> [];
}
export type FunctionMiddleware<CTX, R, N = unknown> = N extends true
  ? (req: CTX, res: R, next: N) => any
  : (context: CTX, next: R, options?: any) => any;
export type ClassMiddleware<CTX, R, N> = new (...args) => IMiddleware<
  CTX,
  R,
  N
>;

export type CompositionMiddleware<CTX, R, N> = {
  middleware: ClassMiddleware<CTX, R, N>;
  options: any;
  name?: string;
};
export type CommonMiddleware<CTX, R, N> =
  | ClassMiddleware<CTX, R, N>
  | FunctionMiddleware<CTX, R, N>
  | CompositionMiddleware<CTX, R, N>;
export type CommonMiddlewareUnion<CTX, R, N> =
  | CommonMiddleware<CTX, R, N>
  | Array<CommonMiddleware<CTX, R, N>>;
export type MiddlewareRespond<CTX, R, N> = (
  context: CTX,
  nextOrRes?: N extends true ? R : NextFunction,
  next?: N
) => Promise<any>;

/**
 * Common Exception Filter definition
 */
export interface IFilter<CTX, R, N> {
  catch?(err: Error, ctx: CTX, res?: R, next?: N): any;
  match?(result: any, ctx: CTX, res?: R, next?: N): any;
}
export type CommonFilterUnion<CTX, R, N> =
  | (new (...args) => IFilter<CTX, R, N>)
  | Array<new (...args) => IFilter<CTX, R, N>>;

/**
 * Guard definition
 */
export interface IGuard<CTX = unknown> {
  canActivate(ctx: CTX, supplierClz: new (...args) => any, methodName: string): boolean | Promise<boolean>;
}

export type CommonGuardUnion<CTX = unknown> =
  | (new (...args) => IGuard<CTX>)
  | Array<new (...args) => IGuard<CTX>>;

export interface IMiddlewareManager<CTX, R, N> {
  insertFirst(middleware: CommonMiddlewareUnion<CTX, R, N>): void;
  insertLast(middleware: CommonMiddlewareUnion<CTX, R, N>): void;
  insertBefore(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrBeforeMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ): void;
  insertAfter(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrAfterMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ): void;
  findAndInsertAfter(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string,
    afterMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ): void;
  findAndInsertBefore(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string,
    beforeMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ): void;
  findAndInsertFirst(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string
  ): void;
  findAndInsertLast(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string
  ): void;
  findItemIndex(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string | number
  ): number;
  findItem(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string | number
  ): CommonMiddleware<CTX, R, N>;
  getMiddlewareName(middleware: CommonMiddleware<CTX, R, N>): string;
  remove(
    middlewareOrNameOrIdx: CommonMiddleware<CTX, R, N> | string | number
  ): CommonMiddleware<CTX, R, N>;
  push(...items: CommonMiddleware<CTX, R, N>[]): number;
  unshift(...items: CommonMiddleware<CTX, R, N>[]): number;
  getNames(): string[];
}

export interface IMidwayBaseApplication<CTX extends IMidwayContext> {
  /**
   * Get a base directory for project, with src or dist
   */
  getBaseDir(): string;

  /**
   * Get a project root directory, without src or dist
   */
  getAppDir(): string;

  /**
   * Get a environment value, read from MIDWAY_SERVER_ENV
   */
  getEnv(): string;

  /**
   * get current related framework
   */
  getFramework(): IMidwayFramework<this, CTX, unknown>;

  /**
   * Get current running process type, app or agent, just for egg
   */
  getProcessType(): MidwayProcessTypeEnum;

  /**
   * Get global Midway IoC Container
   */
  getApplicationContext(): IMidwayGlobalContainer;

  /**
   * Get all configuration values or get the specified configuration through parameters
   * @param key config key
   */
  getConfig<T = any>(key?: string): T;

  /**
   * Get default logger object or get the specified logger through parameters
   * @param name
   */
  getLogger(name?: string): ILogger;

  /**
   * Get core logger
   */
  getCoreLogger(): ILogger;

  /**
   * Create a logger by name and options
   * @param name
   * @param options
   */
  createLogger(name: string, options: MidwayLoggerOptions): ILogger;

  /**
   * Get project name, just package.json name
   */
  getProjectName(): string;

  /**
   * create a context with RequestContainer
   * @param args
   */
  createAnonymousContext(...args): CTX;

  /**
   * Set a context logger class to change default context logger format
   * @param BaseContextLoggerClass
   */
  setContextLoggerClass(BaseContextLoggerClass: any): void;

  /**
   * Add new value to current config
   * @param obj
   */
  addConfigObject(obj: any);

  /**
   * Set value to app attribute map
   * @param key
   * @param value
   */
  setAttr(key: string, value: any);

  /**
   * Get value from app attribute map
   * @param key
   */
  getAttr<T>(key: string): T;

  /**
   * add global filter to app
   * @param Middleware
   */
  useMiddleware<R, N>(Middleware: CommonMiddlewareUnion<CTX, R, N>): void;

  /**
   * get global middleware
   */
  getMiddleware<R, N>(): IMiddlewareManager<CTX, R, N>;

  /**
   * add exception filter
   * @param Filter
   */
  useFilter<R, N>(Filter: CommonFilterUnion<CTX, R, N>): void;

  /**
   * add global guard
   * @param guard
   */
  useGuard(guard: CommonGuardUnion<CTX>): void;

  /**
   * get current namespace
   */
  getNamespace(): string;
}

export type IMidwayApplication<
  T extends IMidwayContext = IMidwayContext,
  FrameworkApplication = unknown
> = IMidwayBaseApplication<T> & FrameworkApplication;

export type ModuleLoadType = 'commonjs' | 'esm';

export interface IMidwayBootstrapOptions {
  baseDir?: string;
  appDir?: string;
  applicationContext?: IMidwayGlobalContainer;
  preloadModules?: any[];
  imports?: any | any[];
  moduleLoadType?: ModuleLoadType;
  logger?: boolean | ILogger;
  globalConfig?:
    | Array<{ [environmentName: string]: Record<string, any> }>
    | Record<string, any>;
  asyncContextManager?: AsyncContextManager;
  loggerFactory?: LoggerFactory<any, any>;
}

export interface IConfigurationOptions {
  logger?: ILogger;
  appLogger?: ILogger;
  contextLoggerApplyLogger?: string;
  contextLoggerFormat?: any;
}

export interface IMidwayFramework<
  APP extends IMidwayApplication<CTX>,
  CTX extends IMidwayContext,
  CONFIG extends IConfigurationOptions,
  ResOrNext = unknown,
  Next = unknown
> {
  app: APP;
  configurationOptions: CONFIG;
  configure(options?: CONFIG): CONFIG;
  isEnable(): boolean;
  initialize(options: IMidwayBootstrapOptions): Promise<void>;
  run(): Promise<void>;
  stop(): Promise<void>;
  getApplication(): APP;
  getApplicationContext(): IMidwayGlobalContainer;
  getConfiguration(key?: string): any;
  getCurrentEnvironment(): string;
  getFrameworkName(): string;
  getAppDir(): string;
  getBaseDir(): string;
  getLogger(name?: string): ILogger;
  getCoreLogger(): ILogger;
  createLogger(name: string, options: MidwayLoggerOptions): ILogger;
  getProjectName(): string;
  useMiddleware(Middleware: CommonMiddlewareUnion<CTX, ResOrNext, Next>): void;
  getMiddleware(): IMiddlewareManager<CTX, ResOrNext, Next>;
  applyMiddleware(
    lastMiddleware?: CommonMiddlewareUnion<CTX, ResOrNext, Next>
  ): Promise<MiddlewareRespond<CTX, ResOrNext, Next>>;
  useFilter(Filter: CommonFilterUnion<CTX, ResOrNext, Next>): void;
  useGuard(guard: CommonGuardUnion<CTX>): void;
  runGuard(ctx: CTX, supplierClz: new (...args) => any, methodName: string): Promise<boolean>;
  getNamespace(): string;
  setFrameworkLoggerName(name: string): void;
}

export interface MidwayAppInfo {
  pkg: Record<string, any>;
  name: string;
  baseDir: string;
  appDir: string;
  HOME: string;
  root: string;
  env: string;
}

/**
 * midway global config definition
 */
export interface MidwayConfig extends FileConfigOption<MidwayCoreDefaultConfig> {
  [customConfigKey: string]: unknown;
}

export interface IServiceFactory<Client> {
  get(clientId: string): Client;
  has(clientId: string): boolean;
  createInstance(config: any, clientId?: string): Promise<Client | undefined>;
  getName(): string;
  stop(): Promise<void>;
  getDefaultClientName(): string;
  getClients(): Map<string, Client>;
  getClientKeys(): string[];
  getClientPriority(clientName: string): string;
  isHighPriority(clientName: string): boolean;
  isMediumPriority(clientName: string): boolean;
  isLowPriority(clientName: string) : boolean;
}

export interface IDataSourceManager<DataSource, DataSourceConfig> {
  createInstance(config: DataSourceConfig): Promise<DataSource | void>;
  getDataSource(dataSourceName: string): DataSource;
  getDataSourceNames(): string[];
  getAllDataSources(): Map<string, DataSource>;
  hasDataSource(dataSourceName: string): boolean;
  isConnected(dataSourceName: string): Promise<boolean>;
  getDefaultDataSourceName(): string;
  stop(): Promise<void>;
  getDataSourcePriority(dataSourceName: string): string;
  isHighPriority(dataSourceName: string): boolean;
  isMediumPriority(dataSourceName: string): boolean;
  isLowPriority(dataSourceName: string): boolean;
}

export interface ISimulation {
  setup?(): Promise<void>;
  tearDown?(): Promise<void>;
  appSetup?(app: IMidwayApplication): Promise<void>;
  contextSetup?(ctx: IMidwayContext, app: IMidwayApplication): Promise<void>;
  contextTearDown?(ctx: IMidwayContext, app: IMidwayApplication): Promise<void>;
  appTearDown?(app: IMidwayApplication): Promise<void>;
  enableCondition(): boolean | Promise<boolean>;
}

export interface HealthResult {
  /**
   * health status
   */
  status: boolean;
  /**
   * failed reason
   */
  reason?: string;
}

export interface HealthResults {
  /**
   * health status
   */
  status: boolean;
  /**
   * first failed namespace
   */
  namespace: string;
  /**
   * first failed reason
   */
  reason?: string;
  results?: Array<{
    namespace: string;
    status: boolean;
    reason?: string;
  }>;
}

export interface ServerSendEventMessage {
  data?: string | object;
  event?: string;
  id?: string;
  retry?: number;
}

export interface ServerStreamOptions<CTX extends IMidwayContext> {
  tpl?: (data: unknown, ctx: CTX) => unknown;
}

export interface ServerSendEventStreamOptions<CTX extends IMidwayContext> {
  closeEvent?: string;
  tpl?: (data: ServerSendEventMessage, ctx: CTX) => ServerSendEventMessage;
}

export interface IComponentInfo {
  component: { Configuration: ClassType<ILifeCycle> } | FunctionalConfiguration;
  enabledEnvironment?: string[];
}

export interface InjectionConfigurationOptions {
  imports?: Array<
    | IComponentInfo
    | { Configuration: ClassType<ILifeCycle> }
    | FunctionalConfiguration
  >;
  importObjects?: Record<string, unknown>;
  importConfigs?:
    | Array<{ [environmentName: string]: Record<string, any> }>
    | Record<string, any>;
  importConfigFilter?: (config: Record<string, any>) => Record<string, any>;
  namespace?: string;
  detector?: IFileDetector | false;
}

export type FunctionalConfigurationOptions = InjectionConfigurationOptions & ILifeCycle;

/**
 * 负载均衡策略类型
 */
export const LoadBalancerType = {
  RANDOM: 'random',
  ROUND_ROBIN: 'roundRobin',
} as const;

export type LoadBalancerType = typeof LoadBalancerType[keyof typeof LoadBalancerType];

export const ServiceDiscoveryHealthCheckType = {
  SELF: 'self',
  TTL: 'ttl',
  HTTP: 'http',
  TCP: 'tcp',
  CUSTOM: 'custom'
} as const;

export type ServiceDiscoveryHealthCheckType = typeof ServiceDiscoveryHealthCheckType[keyof typeof ServiceDiscoveryHealthCheckType];

/**
 * 基础健康检查配置
 */
export interface BaseServiceDiscoveryHealthCheckOptions {
  /**
   * 检查间隔（毫秒）
   */
  interval?: number;
  /**
   * 检查超时时间（毫秒）
   */
  timeout?: number;
  /**
   * 最大重试次数
   */
  maxRetries?: number;
  /**
   * 重试间隔（毫秒）
   */
  retryInterval?: number;
}

/**
 * TTL 健康检查配置
 */
export interface TTLServiceDiscoveryHealthCheckOptions extends BaseServiceDiscoveryHealthCheckOptions {
  /**
   * TTL 时间（秒）
   */
  ttl: number;
}

/**
 * HTTP 健康检查配置
 */
export interface HTTPServiceDiscoveryHealthCheckOptions extends BaseServiceDiscoveryHealthCheckOptions {
  /**
   * 健康检查 URL
   */
  url: string;
  /**
   * HTTP 方法
   */
  method?: string;
  /**
   * HTTP 请求头
   */
  headers?: Record<string, string>;
  /**
   * 期望的 HTTP 状态码
   */
  expectedStatus?: number;
}

/**
 * TCP 健康检查配置
 */
export interface TCPServiceDiscoveryHealthCheckOptions extends BaseServiceDiscoveryHealthCheckOptions {
  /**
   * 主机地址
   */
  host: string;
  /**
   * 端口号
   */
  port: number;
}

/**
 * 健康检查配置联合类型
 */
export type ServiceDiscoveryHealthCheckOptions = TTLServiceDiscoveryHealthCheckOptions | HTTPServiceDiscoveryHealthCheckOptions | TCPServiceDiscoveryHealthCheckOptions;

export interface ServiceDiscoveryBaseInstance {}

export interface DefaultInstanceMetadata {
  id: string;
  serviceName: string;
  host: string;
  port: number;
  metadata: Record<string, any>;
}

/**
 * 健康检查结果
 */
export interface ServiceDiscoveryHealthCheckResult {
  status: 'passing' | 'warning' | 'critical' | 'unknown';
  message?: string;
  timestamp: number;
}

export interface IServiceDiscoveryHealthCheck<ServiceInstance> {
  check(instance: ServiceInstance): Promise<ServiceDiscoveryHealthCheckResult>;
}

export interface ServiceDiscoveryOptions<ServiceInstance, serviceOptions = Record<string, any>> {
  selfRegister?: boolean;
  serviceDiscoveryClient?: string;
  serviceOptions?: serviceOptions;
  loadBalancer?: LoadBalancerType | ILoadBalancer<ServiceInstance>;
}

/**
 * 负载均衡策略接口
 */
export interface ILoadBalancer<ServiceInstance> {
  /**
   * 从服务实例列表中选择一个实例
   * @param instances 服务实例列表
   */
  select(instances: ServiceInstance[]): ServiceInstance;
}


export interface IServiceDiscovery<ServiceInstance> {
  /**
   * 注册服务实例
   */
  register(): Promise<void>;
  /**
   * 上线服务实例
   */
  online(): Promise<void>;
  /**
   * 下线服务实例
   */
  offline(): Promise<void>;
  /**
   * 获取所有可用的服务列表
   * @param serviceName 服务名称
   */
  getInstances<GetInstanceOptions>(serviceName: string | GetInstanceOptions): Promise<ServiceInstance[]>;
  /**
   * 获取一个可用的服务实例
   * @param serviceName 服务名称
   */
  getInstance<GetInstanceOptions>(serviceName: string | GetInstanceOptions): Promise<ServiceInstance>;
}
