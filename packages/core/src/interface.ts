import {
  ObjectIdentifier,
  IManagedInstance,
  ScopeEnum,
  ObjectDefinitionOptions,
  IMethodAspect,
  AspectMetadata,
  MidwayFrameworkType
} from '@midwayjs/decorator';
import { ILogger, LoggerOptions } from '@midwayjs/logger';

/**
 * 生命周期定义
 */
export interface ILifeCycle {
  onConfigLoad?(container: IMidwayContainer, app?: IMidwayApplication): Promise<any>;
  onReady(container: IMidwayContainer, app?: IMidwayApplication): Promise<void>;
  onStop?(container: IMidwayContainer, app?: IMidwayApplication): Promise<void>;
}

export type Locale = string;

/**
 * 多语言支持接口
 */
export interface IMessageSource {
  get(
    code: string,
    args?: any[],
    defaultMessage?: string,
    locale?: Locale
  ): string;
}
/**
 * 对象容器抽象
 * 默认用Xml容器实现一个
 */
export interface IObjectFactory {
  registry: IObjectDefinitionRegistry;
  get<T>(identifier: new () => T, args?: any): T;
  get<T>(identifier: ObjectIdentifier, args?: any): T;
  getAsync<T>(identifier: new () => T, args?: any): Promise<T>;
  getAsync<T>(identifier: ObjectIdentifier, args?: any): Promise<T>;
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
  // 暂存依赖的 key、propertyName
  handlerProps: HandlerProp[];
}

export interface HandlerProp {
  handlerKey: string;
  prop: FrameworkDecoratorMetadata;
}

/**
 * 对象描述元数据，用于生成对象定义
 */
export interface IObjectDefinitionMetadata {
  namespace?: string;
  id: ObjectIdentifier;
  name: string;
  initMethod: string;
  destroyMethod: string;
  constructMethod: string;
  scope: ScopeEnum;
  srcPath: string;
  path: any;
  export: string;
  dependsOn: ObjectIdentifier[];
  constructorArgs: Array<{ value?: string; args?: any; type: string; } | undefined>;
  asynchronous: boolean;
  properties: any[];
  definitionType: 'object' | 'function';
  // 暂存依赖的 key、propertyName
  handlerProps: HandlerProp[];
}

export interface FrameworkDecoratorMetadata {
  key: string;
  targetKey: string;
  propertyName: string;
  meta: any;
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
export interface IProperties {
  readonly size: number;
  keys(): ObjectIdentifier[];
  get(key: ObjectIdentifier, ...args: any[]): any;
  dup(key: ObjectIdentifier): any;
  has(key: ObjectIdentifier): boolean;
  set(key: ObjectIdentifier, value: any): any;
  putAll(props: IProperties): void;
  toJSON(): object;
  stringPropertyNames(): ObjectIdentifier[];
  getProperty(key: ObjectIdentifier, defaultValue?: any): any;
  addProperty(key: ObjectIdentifier, value: any): void;
  setProperty(key: ObjectIdentifier, value: any): any;
  clear(): void;
}
/**
 * 资源配置抽象
 */
export interface IResource {
  readonly name: string;
  readonly contentLength: number;
  readonly lastModified: number;
  encoding: string;
  exists(): boolean;
  isDir(): boolean;
  isFile(): boolean;
  isURL(): boolean;
  getURL(): any;
  getPath(): string;
  getContent(): Buffer;
  getContentAsJSON(): object;
  getSubResources(): IResource[];
  createRelative(path: string): IResource;
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

export interface ObjectDependencyTree {
  scope: ScopeEnum;
  name: string;
  constructorArgs: string[];
  properties: string[];
}

export const REQUEST_CTX_KEY = 'ctx';
export const REQUEST_OBJ_CTX_KEY = '_req_ctx';
export const HTTP_SERVER_KEY = '_midway_http_server';

export interface IContainerConfiguration {
  namespace: string;
  packageName: string;
  addLoadDir(dir: string);
  addImports(imports: string[], baseDir?: string);
  addImportObjects(importObjects: Record<string, unknown>);
  addImportConfigs(importConfigs: string[], baseDir: string);
  load(packageName: string);
  loadComponentObject(componentObject: any);
  loadConfiguration(
    configuration: IContainerConfiguration,
    baseDir: string,
    filePath?: string
  );
  getImportDirectory(): string[];
  getImportObjects(): any;
  bindConfigurationClass(clzz: any, filePath?: string);
}

export type HandlerFunction = (handlerKey: string, instance?: any) => any;

export interface IResolverHandler {
  beforeEachCreated(target, constructorArgs: any[], context);
  afterEachCreated(instance, context, definition);
  registerHandler(key: string, fn: HandlerFunction);
  hasHandler(key: string): boolean;
  getHandler(key: string);
}

export interface IIdentifierRelationShip {
  saveClassRelation(module: any, namespace?: string);
  saveFunctionRelation(ObjectIdentifier, uuid);
  hasRelation(id: ObjectIdentifier): boolean;
  getRelation(id: ObjectIdentifier): string;
}

export interface IMidwayContainer extends IObjectFactory {
  parent: IMidwayContainer;
  identifierMapping: IIdentifierRelationShip;
  ready();
  stop(): Promise<void>;
  registerObject(identifier: ObjectIdentifier, target: any);
  load(module?: any);
  bind<T>(target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
  ): void;
  bindClass(exports, namespace?: string, filePath?: string);
  getDebugLogger();
  setFileDetector(fileDetector: IFileDetector);
  registerDataHandler(handlerType: string, handler: (...args) => any);
  createChild(): IMidwayContainer;
  getConfigService(): IConfigService;
  getEnvironmentService(): IEnvironmentService;
  getInformationService(): IInformationService;
  setInformationService(service: IInformationService): void;
  getAspectService(): IAspectService;
  getCurrentEnv(): string;
  getResolverHandler(): IResolverHandler;
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

export interface IAspectService {
  loadAspect();
  addAspect(aspectIns: IMethodAspect, aspectData: AspectMetadata);
  wrapperAspectToInstance(ins);
  hasAspect(module): boolean;
}

export interface IMiddleware<T> {
  resolve: () => (context: T, next: () => Promise<any>) => any;
}

export enum MidwayProcessTypeEnum {
  APPLICATION = 'APPLICATION',
  AGENT = 'AGENT',
}

/**
 * @deprecated use IMidwayLogger or ILogger from \@midwayjs/logger
 */
export interface IMidwayLogger extends ILogger {}

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
}

export type IMidwayApplication<T extends IMidwayContext = IMidwayContext, FrameworkApplication = unknown> = IMidwayBaseApplication<T> & FrameworkApplication;

export interface IMidwayBootstrapOptions {
  logger?: ILogger | boolean;
  baseDir?: string;
  appDir?: string;
  preloadModules?: any[];
  disableAutoLoad?: boolean;
  pattern?: string[];
  ignore?: string[];
  isTsMode?: boolean;
  middleware?: string[];
  loadDir?: string[];
  disableConflictCheck?: boolean;
  applicationContext?: IMidwayContainer;
  isMainFramework?: boolean;
  globalApplicationHandler?: (type: MidwayFrameworkType) => IMidwayApplication;
  globalConfig?: any;
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
}

export const MIDWAY_LOGGER_WRITEABLE_DIR = 'MIDWAY_LOGGER_WRITEABLE_DIR';
