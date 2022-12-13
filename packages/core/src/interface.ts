import type { LoggerOptions, LoggerContextFormat } from '@midwayjs/logger';
import * as EventEmitter from 'events';
import type { AsyncContextManager } from './common/asyncContextManager';
import type { LoggerFactory } from './common/loggerFactory';
import type { IManagedInstance, IMethodAspect, ObjectIdentifier } from './decorator';
import { FrameworkType, ScopeEnum } from './decorator';

export interface ILogger {
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
}

export interface MidwayCoreDefaultConfig {
  midwayLogger?: ServiceFactoryConfigOption<LoggerOptions>;
  debug?: {
    recordConfigMergeOrder?: boolean;
  };
  asyncContextManager: {
    enable: boolean;
  };
}

export type PowerPartial<T> = {
  [U in keyof T]?: T[U] extends {} ? PowerPartial<T[U]> : T[U];
};

export type ServiceFactoryConfigOption<OPTIONS> = {
  default?: PowerPartial<OPTIONS>;
  client?: PowerPartial<OPTIONS>;
  clients?: {
    [key: string]: PowerPartial<OPTIONS>;
  };
  defaultClientName?: string;
};

export type DataSourceManagerConfigOption<OPTIONS> = {
  default?: PowerPartial<OPTIONS>;
  defaultDataSourceName?: string;
  dataSource?: {
    [key: string]: PowerPartial<{
      entities: any[],
    } & OPTIONS>;
  };
};

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
 * Make object property writeable
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

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
    identifier: new (...args) => T,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  get<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  getAsync<T>(
    identifier: new (...args) => T,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
  getAsync<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
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
  onBeforeBind(fn: (Clzz: any, options: ObjectBeforeBindOptions) => void);
  onBeforeObjectCreated(
    fn: (Clzz: any, options: ObjectBeforeCreatedOptions) => void
  );
  onObjectCreated<T>(fn: (ins: T, options: ObjectCreatedOptions<T>) => void);
  onObjectInit<T>(fn: (ins: T, options: ObjectInitOptions) => void);
  onBeforeObjectDestroy<T>(
    fn: (ins: T, options: ObjectBeforeDestroyOptions) => void
  );
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
  load(): any;
  doConstruct(Clzz: any, args?: any, context?: IMidwayContainer): any;
  doConstructAsync(
    Clzz: any,
    args?: any,
    context?: IMidwayContainer
  ): Promise<any>;
  doInit(obj: any): void;
  doInitAsync(obj: any): Promise<void>;
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

export interface IMidwayContainer extends IObjectFactory, IObjectLifeCycle {
  parent: IMidwayContainer;
  identifierMapping: IIdentifierRelationShip;
  objectCreateEventTarget: EventEmitter;
  ready();
  stop(): Promise<void>;
  registerObject(identifier: ObjectIdentifier, target: any);
  load(module?: any);
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
}

/**
 * @deprecated
 */
export type IApplicationContext = IMidwayContainer;

export interface IFileDetector {
  run(container: IMidwayContainer, fileDetectorOptions?: Record<string, any>);
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
  setCurrentEnvironment(environment: string);
  isDevelopmentEnvironment(): boolean;
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
}

export type IMidwayContext<FrameworkContext = unknown> = Context &
  FrameworkContext;
export type NextFunction = () => Promise<any>;

/**
 * Common middleware definition
 */
export interface IMiddleware<CTX, R, N = unknown> {
  resolve: (app: IMidwayApplication) => FunctionMiddleware<CTX, R, N> | Promise<FunctionMiddleware<CTX, R, N>>;
  match?: (ctx: CTX) => boolean;
  ignore?: (ctx: CTX) => boolean;
}
export type FunctionMiddleware<CTX, R, N = unknown> = N extends true
  ? (req: CTX, res: R, next: N) => any
  : (context: CTX, next: R, options?: any) => any;
export type ClassMiddleware<CTX, R, N> = new (...args) => IMiddleware<
  CTX,
  R,
  N
>;
export type CommonMiddleware<CTX, R, N> =
  | ClassMiddleware<CTX, R, N>
  | FunctionMiddleware<CTX, R, N>;
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
   * @deprecated
   * Get current framework type in MidwayFrameworkType enum
   */
  getFrameworkType(): FrameworkType;

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
  createLogger(name: string, options: LoggerOptions): ILogger;

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
}

export type IMidwayApplication<
  T extends IMidwayContext = IMidwayContext,
  FrameworkApplication = unknown
> = IMidwayBaseApplication<T> & FrameworkApplication;

export interface IMidwayBootstrapOptions {
  [customPropertyKey: string]: any;
  baseDir?: string;
  appDir?: string;
  applicationContext?: IMidwayContainer;
  preloadModules?: any[];
  /**
   * @deprecated please use 'imports'
   */
  configurationModule?: any | any[];
  imports?: any | any[];
  moduleDetector?: 'file' | IFileDetector | false;
  logger?: boolean | ILogger;
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
  contextLoggerFormat?: LoggerContextFormat;
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
  configure(options?: CONFIG);
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
  createLogger(name: string, options: LoggerOptions): ILogger;
  getProjectName(): string;
  useMiddleware(Middleware: CommonMiddlewareUnion<CTX, ResOrNext, Next>): void;
  getMiddleware(): IMiddlewareManager<CTX, ResOrNext, Next>;
  applyMiddleware(
    lastMiddleware?: CommonMiddlewareUnion<CTX, ResOrNext, Next>
  ): Promise<MiddlewareRespond<CTX, ResOrNext, Next>>;
  useFilter(Filter: CommonFilterUnion<CTX, ResOrNext, Next>): void;
  useGuard(guard: CommonGuardUnion<CTX>): void;
  runGuard(ctx: CTX, supplierClz: new (...args) => any, methodName: string): Promise<boolean>;
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
}
