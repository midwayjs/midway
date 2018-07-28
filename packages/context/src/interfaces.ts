export type ObjectIdentifier = string;
export type Scope = 'Singleton' | 'Request' | 'Session' | 'Application';

export interface IScopeEnum {
  Singleton: Scope;
  Request: Scope;
  Session: Scope;
  Application: Scope;
}
/**
 * 生命周期定义
 */
export interface ILifeCycle {
  key: string;
  onStart(): void;
  onReady(): void;
  onRefresh(): void;
  onStop(): void;
}

export type Locale = string;

/**
 * 多语言支持接口
 */
export interface IMessageSource {
  get(code: string,
    args?: any[],
    defaultMessage?: string,
    locale?: Locale): string;
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
  creator: IObjectCreator;
  id: string;
  name: string;
  initMethod: string;
  destroyMethod: string;
  constructMethod: string;
  path: any;
  export: string;
  dependsOn: ObjectIdentifier[];
  constructorArgs: IManagedInstance[];
  properties: IConfiguration;
  isAutowire(): boolean;
  isAsync(): boolean;
  isSingletonScope(): boolean;
  isRequestScope(): boolean;
  isExternal(): boolean;
  isDirect(): boolean;
  hasDependsOn(): boolean;
  hasConstructorArgs(): boolean;
  getAttr(key: ObjectIdentifier): any;
  hasAttr(key: ObjectIdentifier): boolean;
  setAttr(key: ObjectIdentifier, value: any): void;
}
export interface IObjectCreator {
  load(): any;
  doConstruct(Clzz: any, args?: any): any;
  doConstructAsync(Clzz: any, args?: any): Promise<any>;
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
  registerDefinition(identifier: ObjectIdentifier, definition: IObjectDefinition);
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
export interface IConfiguration {
  readonly size: number;
  keys(): ObjectIdentifier[];
  get(key: ObjectIdentifier, ...args: any[]): any;
  dup(key: ObjectIdentifier): any;
  has(key: ObjectIdentifier): boolean;
  set(key: ObjectIdentifier, value: any): any;
  putAll(props: IConfiguration): void;
  toJSON(): Object;
  stringPropertyNames(): ObjectIdentifier[];
  getProperty(key: ObjectIdentifier, defaultValue?: any): any;
  addProperty(key: ObjectIdentifier, value: any): void;
  setProperty(key: ObjectIdentifier, value: any): any;
  clear(): void;
  clone(): IConfiguration;
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
  getContentAsJSON(): Object;
  getSubResources(): IResource[];
  createRelative(path: string): IResource;
}
/**
 * IoC上下文抽象
 */
export interface IApplicationContext extends IObjectFactory {
  baseDir: string;
  parent: IApplicationContext;
  props: IConfiguration;
  configLocations: string[];
  messageSource: IMessageSource;
  refreshAsync(): Promise<void>;
  ready(): Promise<void>;
  addLifeCycle(lifeCycle: ILifeCycle): void;
  removeLifeCycle(lifeCycle: ILifeCycle): void;
  stop(): Promise<void>;
}
/**
 * 内部管理的属性、json、ref等解析实例存储
 */
export interface IManagedInstance {
  type: string;
}
/**
 * 解析内部管理的属性、json、ref等实例的解析器
 * 同时创建这些对象的实际使用的对象
 */
export interface IManagedResolver {
  type: string;
  resolve(managed: IManagedInstance, props: any): any;
  resolveAsync(managed: IManagedInstance, props: any): Promise<any>;
}

export interface ObjectDefinitionOptions {
  isAsync?: boolean;
  initMethod?: string;
  destroyMethod?: string;
  isSingleton?: boolean;
}

/**
 * 提供简化的容器绑定能力
 */
export interface IContainer extends IApplicationContext {
  bind<T>(target: T, options?: ObjectDefinitionOptions): void ;
  bind<T>(identifier: ObjectIdentifier, target: T, options?: ObjectDefinitionOptions): void;
  createChild(): IContainer;
  resolve<T>(target: T): T;
  registerCustomBinding(objectDefinition: IObjectDefinition, target): void;
}

export interface TagPropsMetadata {
  key: string | number | symbol;
  value: any;
}

export interface TagClsMetadata {
  id: string;
  originName: string;
}

export interface ReflectResult {
  [key: string]: TagPropsMetadata[];
}
