import * as EventEmitter from 'events';
import type { AsyncContextManager } from './common/asyncContextManager';
import type { LoggerFactory } from './common/loggerFactory';

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
export type GroupModeType = 'one' | 'multi';

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

export interface IModuleStore {
  listModule(key: ObjectIdentifier);
  saveModule(key: ObjectIdentifier, module: any);
  transformModule?(moduleMap: Map<ObjectIdentifier, Set<any>>);
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
   * @default false
   */
  validateConnection?: boolean;
  /**
   * @default true
   */
  cacheInstance?: boolean | undefined;
}

export type DataSourceManagerConfigOption<OPTIONS, ENTITY_CONFIG_KEY extends string = 'entities'> = {
  default?: OPTIONS;
  defaultDataSourceName?: string;
  dataSource?: {
    [key: string]: PowerPartial<{
      [keyName in ENTITY_CONFIG_KEY]: any[];
    }> & OPTIONS;
  };
} & CreateDataSourceInstanceOptions;

type ConfigType<T> = T extends (...args: any[]) => any
  ? Writable<PowerPartial<ReturnType<T>>>
  : Writable<PowerPartial<T>>;

/**
 * Get definition from config
 */
export type FileConfigOption<T, K = unknown> = K extends keyof ConfigType<T>
  ? Pick<ConfigType<T>, K>
  : ConfigType<T>;


/**
 * Lifecycle Definition
 * 生命周期定义
 */
export interface ILifeCycle extends Partial<IObjectLifeCycle> {
  onConfigLoad?(
    container: IMidwayContainer,
    mainApp?: IMidwayApplication
  ): Promise<any>;
  onReady?(
    container: IMidwayContainer,
    mainApp?: IMidwayApplication
  ): Promise<void>;
  onServerReady?(
    container: IMidwayContainer,
    mainApp?: IMidwayApplication
  ): Promise<void>;
  onHealthCheck?(
    container: IMidwayContainer
  ): Promise<HealthResult>;
  onStop?(
    container: IMidwayContainer,
    mainApp?: IMidwayApplication
  ): Promise<void>;
}

export type ObjectContext = {
  originName?: string;
};

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
  constructorArgs: IManagedInstance[];
  properties: IProperties;
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
  getObject(identifier: ObjectIdentifier): any;
  getIdentifierRelation(): IIdentifierRelationShip;
  setIdentifierRelation(identifierRelation: IIdentifierRelationShip);
}
/**
 * 属性配置抽象
 */
export interface IProperties extends Map<ObjectIdentifier, any> {
  getProperty(key: ObjectIdentifier, defaultValue?: any): any;
  setProperty(key: ObjectIdentifier, value: any): any;
  propertyKeys(): ObjectIdentifier[];
}

/**
 * 解析内部管理的属性、json、ref等实例的解析器
 * 同时创建这些对象的实际使用的对象
 */
export interface IManagedResolver {
  type: string;
  resolve(managed: IManagedInstance): any;
  resolveAsync(managed: IManagedInstance): Promise<any>;
}

export interface IManagedResolverFactoryCreateOptions {
  definition: IObjectDefinition;
  args?: any;
  namespace?: string;
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
  saveClassRelation(module: any, namespace?: string);
  saveFunctionRelation(ObjectIdentifier, uuid);
  hasRelation(id: ObjectIdentifier): boolean;
  getRelation(id: ObjectIdentifier): string;
}

export interface IMidwayContainer extends IObjectFactory, WithFn<IObjectLifeCycle> {
  parent: IMidwayContainer;
  identifierMapping: IIdentifierRelationShip;
  objectCreateEventTarget: EventEmitter;
  ready(): void | Promise<void>;
  stop(): Promise<void>;
  registerObject(identifier: ObjectIdentifier, target: any);
  load(module: any | any[]);
  hasNamespace(namespace: string): boolean;
  getNamespaceList(): string[];
  hasDefinition(identifier: ObjectIdentifier);
  hasObject(identifier: ObjectIdentifier);
  bind<T>(target: T, options?: Partial<IObjectDefinition>): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: Partial<IObjectDefinition>
  ): void;
  bindClass(exports, options?: Partial<IObjectDefinition>);
  setFileDetector(fileDetector: IFileDetector);
  createChild(): IMidwayContainer;
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
   * Get instance IoC container scope
   * @param instance
   */
  getInstanceScope(instance: any): ScopeEnum | undefined;
  /**
   * Get IoC identifier
   */
  getIdentifier(identifier: (ClassType | string)): string;
}

export interface IFileDetector {
  run(container: IMidwayContainer, fileDetectorOptions?: Record<string, any>): void | Promise<void>;
  setExtraDetectorOptions(detectorOptions: Record<string, any>);
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
  getApplicationContext(): IMidwayContainer;

  /**
   * Get all configuration values or get the specified configuration through parameters
   * @param key config key
   */
  getConfig(key?: string): any;

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
  [customPropertyKey: string]: any;
  baseDir?: string;
  appDir?: string;
  applicationContext?: IMidwayContainer;
  preloadModules?: any[];
  imports?: any | any[];
  moduleLoadType?: ModuleLoadType;
  moduleDetector?: IFileDetector | false;
  logger?: boolean | ILogger;
  /**
   * @deprecated please set it from '@Configuration' decorator
   */
  ignore?: string[];
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
  initialize(options: Partial<IMidwayBootstrapOptions>): Promise<void>;
  run(): Promise<void>;
  stop(): Promise<void>;
  getApplication(): APP;
  getApplicationContext(): IMidwayContainer;
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
