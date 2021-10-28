import {
  ObjectIdentifier,
  IManagedInstance,
  ObjectDefinitionOptions,
  MidwayFrameworkType, IMethodAspect
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

/**
 * 对象容器抽象
 * 默认用Xml容器实现一个
 */
export interface IObjectFactory {
  registry: IObjectDefinitionRegistry;
  get<T>(identifier: new (...args) => T, args?: any): T;
  get<T>(identifier: ObjectIdentifier, args?: any): T;
  getAsync<T>(identifier: new (...args) => T, args?: any): Promise<T>;
  getAsync<T>(identifier: ObjectIdentifier, args?: any): Promise<T>;
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

export type MethodHandlerFunction = (target: new (...args) => any, methodName: string, metadata: any) => IMethodAspect;
export type ParameterHandlerFunction = (target: new (...args) => any, methodName: string, metadata: any, originArgs: Array<any>, parameterIndex: number) => IMethodAspect;

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
  bind<T>(target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
  ): void;
  bindClass(exports, options?: ObjectDefinitionOptions);
  getDebugLogger();
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

export interface IMiddleware<T> {
  resolve: () => FunctionMiddleware<T>;
  match?: () => boolean;
  ignore?: () => boolean;
}
export type FunctionMiddleware<T> = (context: T, next: () => Promise<any>) => any;
export type ClassMiddleware<T> = new (...args) => IMiddleware<T>;
export type CommonMiddleware<T> = ClassMiddleware<T> | FunctionMiddleware<T>;
export type CommonMiddlewareUnion<T> = CommonMiddleware<T> | Array<CommonMiddleware<T>>;

/**
 * Common Exception Filter definition
 */
export interface IExceptionFilter<T> {
  catch(err: Error, ctx: T): any;
}
export type CommonExceptionFilterUnion<T> = (new (...args) => IExceptionFilter<T>) | Array<new (...args) => IExceptionFilter<T>>

export interface IMidwayBaseApplication<T extends IMidwayContext = IMidwayContext> {
  getBaseDir(): string;
  getAppDir(): string;
  getEnv(): string;
  getFrameworkType(): MidwayFrameworkType;
  getProcessType(): MidwayProcessTypeEnum;
  getApplicationContext(): IMidwayContainer;
  getConfig(key?: string): any;
  getLogger(name?: string): ILogger;
  getCoreLogger(): ILogger;
  createLogger(name: string, options: LoggerOptions): ILogger;
  getProjectName(): string;
  createAnonymousContext(...args): T;
  setContextLoggerClass(BaseContextLoggerClass: any): void;
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
  useMiddleware(Middleware: CommonMiddlewareUnion<T>): void;

  /**
   * get global middleware
   */
  getMiddleware(): ContextMiddlewareManager<T>;

  /**
   * add exception filter
   * @param Filter
   */
  useFilter(Filter: CommonExceptionFilterUnion<T>): void;
}

export type IMidwayApplication<T extends IMidwayContext = IMidwayContext, FrameworkApplication = unknown> = IMidwayBaseApplication<T> & FrameworkApplication;

export interface IMidwayBootstrapOptions {
  baseDir?: string;
  appDir?: string;
  applicationContext?: IMidwayContainer;
  preloadModules?: any[];
  configurationModule?: any;
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
  configure(options: T): IMidwayFramework<APP, T>;
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
