import {
  ObjectIdentifier,
  IManagedInstance,
  ScopeEnum,
  ObjectDefinitionOptions,
  IMethodAspect,
  AspectMetadata,
} from '@midwayjs/decorator';
/**
 * 生命周期定义
 */
export interface ILifeCycle {
  onReady(container?: IMidwayContainer): Promise<void>;
  onStop?(container?: IMidwayContainer): Promise<void>;
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
  isAsync(identifier: ObjectIdentifier): boolean;
  get<T>(identifier: ObjectIdentifier, args?: any): T;
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
  isAutowire(): boolean;
  isAsync(): boolean;
  isSingletonScope(): boolean;
  isRequestScope(): boolean;
  hasDependsOn(): boolean;
  hasConstructorArgs(): boolean;
  getAttr(key: ObjectIdentifier): any;
  hasAttr(key: ObjectIdentifier): boolean;
  setAttr(key: ObjectIdentifier, value: any): void;
}
export interface IObjectCreator {
  load(): any;
  doConstruct(Clzz: any, args?: any, context?: IApplicationContext): any;
  doConstructAsync(
    Clzz: any,
    args?: any,
    context?: IApplicationContext
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
  getDefinitionByPath(path: string): IObjectDefinition;
  getDefinitionByName(name: string): IObjectDefinition[];
  removeDefinition(identifier: ObjectIdentifier): void;
  hasDefinition(identifier: ObjectIdentifier): boolean;
  clearAll(): void;
  hasObject(identifier: ObjectIdentifier): boolean;
  registerObject(identifier: ObjectIdentifier, target: any);
  getObject(identifier: ObjectIdentifier): any;
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
  clone(): IProperties;
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
 * IoC上下文抽象
 */
export interface IApplicationContext extends IObjectFactory {
  disableConflictCheck: boolean;
  baseDir: string;
  parent: IApplicationContext;
  props: IProperties;
  messageSource: IMessageSource;
  dependencyMap: Map<string, ObjectDependencyTree>;
  ready(): Promise<void>;
  stop(): Promise<void>;
  registerObject(identifier: ObjectIdentifier, target: any, registerByUser?: boolean);
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
/**
 * 提供简化的容器绑定能力
 */
export interface IContainer extends IApplicationContext {
  bind<T>(target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
  ): void;
  createChild(): IContainer;
  resolve<T>(target: T): T;
  registerCustomBinding(objectDefinition: IObjectDefinition, target): void;
}

export interface ObjectDependencyTree {
  scope: ScopeEnum;
  name: string;
  constructorArgs: string[];
  properties: string[];
}

export const REQUEST_CTX_KEY = 'ctx';
export const REQUEST_OBJ_CTX_KEY = '_req_ctx';

export interface IContainerConfiguration {
  namespace: string;
  packageName: string;
  addLoadDir(dir: string);
  addImports(imports: string[], baseDir?: string);
  addImportObjects(importObjects: any[]);
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

export interface IMidwayContainer extends IContainer {
  /**
   * 默认不添加创建的 configuration 到 configurations 数组中
   */
  createConfiguration(): IContainerConfiguration;
  containsConfiguration(namespace: string): boolean;
  addConfiguration(configuration: IContainerConfiguration);
  getConfigService(): IConfigService;
  getEnvironmentService(): IEnvironmentService;
  getCurrentEnv(): string;
  addAspect(
    aspectIns: IMethodAspect,
    aspectData: AspectMetadata
  )
}

export interface IConfigService {
  add(configFilePaths: string[]);
  addObject(obj: object);
  load();
  getConfiguration(configKey?: string);
}

export interface IEnvironmentService {
  getCurrentEnvironment(): string;
  setCurrentEnvironment(environment: string);
}

export interface IMiddleware<T> {
  resolve: () => (context: T, next: () => Promise<any>) => any;
}

export enum MidwayProcessTypeEnum {
  APPLICATION = 'APPLICATION',
  AGENT = 'AGENT',
}

export interface IMidwayLogger {
  debug?(message?: any, ...optionalParams: any[]): void;
  error?(message?: any, ...optionalParams: any[]): void;
  info?(message?: any, ...optionalParams: any[]): void;
  log?(message?: any, ...optionalParams: any[]): void;
  warn?(message?: any, ...optionalParams: any[]): void;
  trace?(message?: any, ...optionalParams: any[]): void;
}

export interface IMidwayApplication {
  getBaseDir(): string;
  getAppDir(): string;
  getEnv(): string;
  getFrameworkType(): MidwayFrameworkType;
  getProcessType(): MidwayProcessTypeEnum;
  getApplicationContext(): IMidwayContainer;
  getConfig(key?: string): any;
  getLogger(key?: string): Partial<IMidwayLogger>;
}

export interface IMidwayContext {
  getRequestContext?(): IMidwayContainer;
  requestContext: IMidwayContainer;
}

/**
 * @deprecated
 */
export interface IMidwayCoreApplication extends IMidwayApplication {}

export interface IMidwayBootstrapOptions {
  logger: IMidwayLogger;
  baseDir: string;
  appDir: string;
  preloadModules: string[];
  disableAutoLoad: boolean;
  pattern: string[];
  ignore: string[];
  isTsMode: boolean;
  middleware: string[];
}

export interface IConfigurationOptions {}

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
}

export enum MidwayFrameworkType {
  WEB = '@midwayjs/web',
  WEB_KOA = '@midwayjs/koa',
  WEB_EXPRESS = '@midwayjs/express',
  FAAS = '@midwayjs/faas',
  MS_HSF = '',
  MS_GRPC = '',
  MS_RABBITMQ = '@midwayjs/rabbitmq',
  WS_IO = '@midwayjs/socketio',
  WSS = '',
  CUSTOM = ''
}
