import {
  ObjectIdentifier,
  IManagedInstance,
  MidwayFrameworkType, IMethodAspect, ScopeEnum
} from '@midwayjs/decorator';
import { ILogger, LoggerOptions } from '@midwayjs/logger';
import * as EventEmitter from 'events';
import { ContextMiddlewareManager } from './util/middlewareManager';

/**
 * 生命周期定义
 */
export interface ILifeCycle extends Partial<IObjectLifeCycle> {
  onConfigLoad?(container: IMidwayContainer, app?: IMidwayApplication): Promise<any>;
  onReady?(container: IMidwayContainer, app?: IMidwayApplication): Promise<void>;
  onServerReady?(container: IMidwayContainer, app?: IMidwayApplication): Promise<void>;
  onStop?(container: IMidwayContainer, app?: IMidwayApplication): Promise<void>;
  onAppError?(err: Error, app: IMidwayApplication);
  onContextError?(err: Error, ctx: IMidwayContext, app: IMidwayApplication);
}

export type ObjectContext = {
  originName?: string;
}

/**
 * 对象容器抽象
 * 默认用Xml容器实现一个
 */
export interface IObjectFactory {
  registry: IObjectDefinitionRegistry;
  get<T>(identifier: new (...args) => T, args?: any, objectContext?: ObjectContext): T;
  get<T>(identifier: ObjectIdentifier, args?: any, objectContext?: ObjectContext): T;
  getAsync<T>(identifier: new (...args) => T, args?: any, objectContext?: ObjectContext): Promise<T>;
  getAsync<T>(identifier: ObjectIdentifier, args?: any, objectContext?: ObjectContext): Promise<T>;
}

export enum ObjectLifeCycleEvent {
  AFTER_BIND = 'afterBind',
  BEFORE_CREATED = 'beforeObjectCreated',
  AFTER_CREATED = 'afterObjectCreated',
  AFTER_INIT = 'afterObjectInit',
  BEFORE_DESTROY = 'beforeObjectDestroy',
}

export interface IObjectLifeCycle {
  onAfterBind(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
      }
    ) => void
  );
  onBeforeObjectCreated(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        constructorArgs: any[];
      }
    ) => void
  );
  onObjectCreated<T>(fn: (
    ins: T,
    options: {
      context: IMidwayContainer,
      definition: IObjectDefinition,
      replaceCallback: (ins: T) => void,
    }
  ) => void);
  onObjectInit<T>(fn: (
    ins: T,
    options: {
      context: IMidwayContainer,
      definition: IObjectDefinition,
    }
  ) => void);
  onBeforeObjectDestroy<T>(fn: (
    ins: T,
    options: {
      context: IMidwayContainer,
      definition: IObjectDefinition,
    }
  ) => void);
}

/**
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

export const REQUEST_CTX_KEY = 'ctx';
export const REQUEST_OBJ_CTX_KEY = '_req_ctx';
export const HTTP_SERVER_KEY = '_midway_http_server';

export type HandlerFunction = (
  /**
   * decorator uuid key
   */
  key: string,
  /**
   * decorator set metadata
   */
  meta: any,
  instance: any) => any;

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
  parameterIndex: number;
}) => IMethodAspect;

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
  run(container: IMidwayContainer);
}

export interface IConfigService {
  add(configFilePaths: any[]);
  addObject(obj: object);
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
}

export type IMidwayContext<FrameworkContext = unknown> = Context & FrameworkContext;

/**
 * Common middleware definition
 */

export interface IMiddleware<T, R = any, N = any> {
  resolve: () => FunctionMiddleware<T, R, N>;
  match?: () => boolean;
  ignore?: () => boolean;
}
export type FunctionMiddleware<T, R = any, N = any> = ((context: T, next: () => Promise<any>, options?: any) => any) | ((req: T, res: R, next: N) => any);
export type ClassMiddleware<T, R = any, N = any> = new (...args) => IMiddleware<T, R, N>;
export type CommonMiddleware<T, R = any, N = any> = ClassMiddleware<T, R, N> | FunctionMiddleware<T, R, N>;
export type CommonMiddlewareUnion<T, R = any, N = any> = CommonMiddleware<T, R, N> | Array<CommonMiddleware<T, R, N>>;
export type MiddlewareRespond<T, R = any, N = any> = (context: T, nextOrRes?: () => Promise<any> | R, next?: N) => Promise<{ result: any; error: Error | undefined }>;

/**
 * Common Exception Filter definition
 */
export interface IExceptionFilter<T, R = any, N = any> {
  catch(err: Error, ctx: T, res?: R, next?: N): any;
}
export type CommonExceptionFilterUnion<T, R = any, N = any> = (new (...args) => IExceptionFilter<T, R, N>) | Array<new (...args) => IExceptionFilter<T, R, N>>

export interface IMidwayBaseApplication<T extends IMidwayContext = IMidwayContext> {
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
   * Get current framework type in MidwayFrameworkType enum
   */
  getFrameworkType(): MidwayFrameworkType;

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
  createAnonymousContext(...args): T;

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
  useMiddleware<R = any, N = any>(Middleware: CommonMiddlewareUnion<T, R, N>): void;

  /**
   * get global middleware
   */
  getMiddleware<R = any, N = any>(): ContextMiddlewareManager<T, R, N>;

  /**
   * add exception filter
   * @param Filter
   */
  useFilter(Filter: CommonExceptionFilterUnion<T>): void;
}

export type IMidwayApplication<T extends IMidwayContext = IMidwayContext, FrameworkApplication = unknown> = IMidwayBaseApplication<T> & FrameworkApplication;

export interface IMidwayBootstrapOptions {
  [customPropertyKey: string]: any;
  baseDir?: string;
  appDir?: string;
  applicationContext?: IMidwayContainer;
  preloadModules?: any[];
  configurationModule?: any | any[];
  moduleDetector?: 'file' | IFileDetector | false;
  logger?: boolean | ILogger;
  ignore?: string[];
}

export interface IConfigurationOptions {
  logger?: ILogger;
  appLogger?: ILogger;
  ContextLoggerClass?: any;
}

export interface IMidwayFramework<APP extends IMidwayApplication, T extends IConfigurationOptions> {
  app: APP;
  configurationOptions: T;
  configure(): T;
  isEnable(): boolean;
  initialize(options: Partial<IMidwayBootstrapOptions>): Promise<void>;
  run(): Promise<void>;
  stop(): Promise<void>;
  getApplication(): APP;
  getApplicationContext(): IMidwayContainer;
  getConfiguration(key?: string): any;
  getCurrentEnvironment(): string;
  getFrameworkType(): MidwayFrameworkType;
  getFrameworkName(): string;
  getAppDir(): string;
  getBaseDir(): string;
  getLogger(name?: string): ILogger;
  getCoreLogger(): ILogger;
  createLogger(name: string, options: LoggerOptions): ILogger;
  getProjectName(): string;
  getDefaultContextLoggerClass(): any;
  useMiddleware(Middleware: CommonMiddlewareUnion<ReturnType<APP['createAnonymousContext']>>);
  getMiddleware<R, N>(lastMiddleware?: CommonMiddleware<ReturnType<APP['createAnonymousContext']>>): Promise<MiddlewareRespond<ReturnType<APP['createAnonymousContext']>, R, N>>;
  useFilter(Filter: CommonExceptionFilterUnion<ReturnType<APP['createAnonymousContext']>>);
}

export const MIDWAY_LOGGER_WRITEABLE_DIR = 'MIDWAY_LOGGER_WRITEABLE_DIR';

export interface MidwayAppInfo {
  pkg: Record<string, any>;
  name: string;
  baseDir: string;
  appDir: string;
  HOME: string;
  root: string;
  env: string;
}
