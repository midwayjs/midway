import {
  CONFIGURATION_KEY,
  DecoratorManager,
  IComponentInfo,
  InjectionConfigurationOptions,
  MAIN_MODULE_KEY,
  OBJECT_DEFINITION_KEY,
  PROPERTY_INJECT_KEY,
  CUSTOM_PROPERTY_INJECT_KEY,
  SCOPE_KEY,
} from '../decorator';
import { FunctionalConfiguration } from '../functional/configuration';
import * as util from 'util';
import { ObjectDefinitionRegistry } from './definitionRegistry';
import {
  ClassType,
  IFileDetector,
  IIdentifierRelationShip,
  IMidwayContainer,
  IModuleStore,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  ObjectIdentifier,
  ObjectLifeCycleEvent,
  PropertyInjectMetadata,
  ScopeEnum,
} from '../interface';
import {
  CONTAINER_OBJ_SCOPE,
  FUNCTION_INJECT_KEY,
  REQUEST_CTX_KEY,
  SINGLETON_CONTAINER_CTX,
} from '../constants';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { ManagedResolverFactory } from './managedResolverFactory';
import { MidwayEnvironmentService } from '../service/environmentService';
import { MidwayConfigService } from '../service/configService';
import { EventEmitter } from 'events';
import { Types } from '../util/types';
import { Utils } from '../util';
import { MetadataManager } from '../decorator/metadataManager';

const debug = util.debuglog('midway:debug');
const debugBind = util.debuglog('midway:bind');
const debugSpaceLength = 9;

class ContainerConfiguration {
  private loadedMap = new WeakMap();
  private namespaceList = [];
  private configurationOptionsList: Array<InjectionConfigurationOptions> = [];
  constructor(readonly container: IMidwayContainer) {}

  load(module) {
    let namespace = MAIN_MODULE_KEY;
    // 可能导出多个
    const configurationExports = this.getConfigurationExport(module);
    if (!configurationExports.length) return;
    // 多个的情况，数据交给第一个保存
    for (let i = 0; i < configurationExports.length; i++) {
      const configurationExport = configurationExports[i];

      if (this.loadedMap.get(configurationExport)) {
        // 已经加载过就跳过循环
        continue;
      }

      let configurationOptions: InjectionConfigurationOptions;
      if (configurationExport instanceof FunctionalConfiguration) {
        // 函数式写法
        configurationOptions = configurationExport.getConfigurationOptions();
      } else {
        // 普通类写法
        configurationOptions = MetadataManager.getOwnMetadata(
          CONFIGURATION_KEY,
          configurationExport
        );
      }

      // 已加载标记，防止死循环
      this.loadedMap.set(configurationExport, true);

      if (configurationOptions) {
        if (configurationOptions.namespace !== undefined) {
          namespace = configurationOptions.namespace;
          this.namespaceList.push(namespace);
        }
        this.configurationOptionsList.push(configurationOptions);
        debug(`[core]: load configuration in namespace="${namespace}"`);
        this.addImports(configurationOptions.imports);
        this.addImportObjects(configurationOptions.importObjects);
        this.addImportConfigs(configurationOptions.importConfigs);
        this.addImportConfigFilter(configurationOptions.importConfigFilter);
        this.bindConfigurationClass(configurationExport, namespace);
      }
    }

    // bind module
    this.container.bindClass(module, {
      namespace,
    });
  }

  addImportConfigs(
    importConfigs:
      | Array<{ [environmentName: string]: Record<string, any> }>
      | Record<string, any>
  ) {
    if (importConfigs) {
      if (Array.isArray(importConfigs)) {
        this.container.get(MidwayConfigService).add(importConfigs);
      } else {
        this.container.get(MidwayConfigService).addObject(importConfigs);
      }
    }
  }

  addImportConfigFilter(
    importConfigFilter: (config: Record<string, any>) => Record<string, any>
  ) {
    if (importConfigFilter) {
      this.container.get(MidwayConfigService).addFilter(importConfigFilter);
    }
  }

  addImports(imports: any[] = []) {
    // 处理 imports
    for (let importPackage of imports) {
      if (!importPackage) continue;
      if (typeof importPackage === 'string') {
        importPackage = require(importPackage);
      }
      if ('Configuration' in importPackage) {
        // component is object
        this.load(importPackage);
      } else if ('component' in importPackage) {
        if ((importPackage as IComponentInfo)?.enabledEnvironment) {
          if (
            (importPackage as IComponentInfo)?.enabledEnvironment?.includes(
              this.container
                .get(MidwayEnvironmentService)
                .getCurrentEnvironment()
            )
          ) {
            this.load((importPackage as IComponentInfo).component);
          }
        } else {
          this.load((importPackage as IComponentInfo).component);
        }
      } else {
        this.load(importPackage);
      }
    }
  }

  /**
   * 注册 importObjects
   * @param objs configuration 中的 importObjects
   */
  addImportObjects(objs: any) {
    if (objs) {
      const keys = Object.keys(objs);
      for (const key of keys) {
        if (typeof objs[key] !== undefined) {
          this.container.registerObject(key, objs[key]);
        }
      }
    }
  }

  bindConfigurationClass(clzz, namespace) {
    if (clzz instanceof FunctionalConfiguration) {
      // 函数式写法不需要绑定到容器
    } else {
      // 普通类写法
      DecoratorManager.saveProviderId(undefined, clzz);
      const id = DecoratorManager.getProviderUUId(clzz);
      this.container.bind(id, clzz, {
        namespace: namespace,
        scope: ScopeEnum.Singleton,
      });
    }

    // configuration 手动绑定去重
    const configurationMods = DecoratorManager.listModule(CONFIGURATION_KEY);
    const exists = configurationMods.find(mod => {
      return mod.target === clzz;
    });
    if (!exists) {
      DecoratorManager.saveModule(CONFIGURATION_KEY, {
        target: clzz,
        namespace: namespace,
      });
    }
  }

  private getConfigurationExport(exports): any[] {
    const mods = [];
    if (
      Types.isClass(exports) ||
      Types.isFunction(exports) ||
      exports instanceof FunctionalConfiguration
    ) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (
          Types.isClass(module) ||
          Types.isFunction(module) ||
          module instanceof FunctionalConfiguration
        ) {
          mods.push(module);
        }
      }
    }
    return mods;
  }

  public getNamespaceList() {
    return this.namespaceList;
  }

  public getConfigurationOptionsList() {
    return this.configurationOptionsList;
  }
}

export class MidwayContainer implements IMidwayContainer, IModuleStore {
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: IObjectDefinitionRegistry = null;
  private _identifierMapping = null;
  private moduleMap = null;
  private _objectCreateEventTarget: EventEmitter;
  public parent: IMidwayContainer = null;
  // 仅仅用于兼容 requestContainer 的 ctx
  protected ctx = SINGLETON_CONTAINER_CTX;
  private fileDetector: IFileDetector | false | undefined;
  private attrMap: Map<string, any> = new Map();
  private _namespaceSet: Set<string> = null;

  constructor(parent?: IMidwayContainer) {
    this.parent = parent;
    this.init();
  }

  protected init() {
    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject(REQUEST_CTX_KEY, this.ctx);
  }

  get objectCreateEventTarget() {
    if (!this._objectCreateEventTarget) {
      this._objectCreateEventTarget = new EventEmitter();
    }
    return this._objectCreateEventTarget;
  }

  get registry(): IObjectDefinitionRegistry {
    if (!this._registry) {
      this._registry = new ObjectDefinitionRegistry();
    }
    return this._registry;
  }

  set registry(registry) {
    this._registry = registry;
  }

  get identifierMapping(): IIdentifierRelationShip {
    if (!this._identifierMapping) {
      this._identifierMapping = this.registry.getIdentifierRelation();
    }
    return this._identifierMapping;
  }

  get namespaceSet(): Set<string> {
    if (!this._namespaceSet) {
      this._namespaceSet = new Set();
    }
    return this._namespaceSet;
  }

  load(module) {
    if (!Array.isArray(module)) {
      module = [module];
    }
    // load configuration
    const configuration = new ContainerConfiguration(this);

    for (const mod of module) {
      if (mod) {
        configuration.load(mod);
      }
    }
    for (const ns of configuration.getNamespaceList()) {
      this.namespaceSet.add(ns);
      debug(`[core]: load configuration in namespace="${ns}" complete`);
    }

    const configurationOptionsList =
      configuration.getConfigurationOptionsList() ?? [];

    // find user code configuration it's without namespace
    const userCodeConfiguration =
      configurationOptionsList.find(options => !options.namespace) ?? {};

    this.fileDetector = userCodeConfiguration.detector ?? this.fileDetector;

    if (this.fileDetector) {
      this.fileDetector.setExtraDetectorOptions({
        conflictCheck: userCodeConfiguration.conflictCheck,
        ...userCodeConfiguration.detectorOptions,
      });
    }
  }

  protected loadDefinitions(): void | Promise<void> {
    // load project file
    if (this.fileDetector) {
      return this.fileDetector.run(this);
    }
  }

  bindClass(exports, options?: Partial<IObjectDefinition>) {
    if (Types.isClass(exports) || Types.isFunction(exports)) {
      this.bindModule(exports, options);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (Types.isClass(module) || Types.isFunction(module)) {
          this.bindModule(module, options);
        }
      }
    }
  }

  bind<T>(target: T, options?: Partial<IObjectDefinition>): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: Partial<IObjectDefinition>
  ): void;
  bind<T>(identifier: any, target: any, options?: any): void {
    if (Types.isClass(identifier) || Types.isFunction(identifier)) {
      return this.bindModule(identifier, target);
    }

    if (this.registry.hasDefinition(identifier)) {
      // 如果 definition 存在就不再重复 bind
      return;
    }

    if (options?.bindHook) {
      options.bindHook(target, options);
    }

    let definition;
    if (Types.isClass(target)) {
      definition = new ObjectDefinition();
      definition.name = DecoratorManager.getProviderName(target);
    } else {
      definition = new FunctionDefinition();
      if (!Types.isAsyncFunction(target)) {
        definition.asynchronous = false;
      }
      definition.name = definition.id;
    }

    definition.path = target;
    definition.id = identifier;
    definition.srcPath = options?.srcPath || null;
    definition.namespace = options?.namespace || '';
    definition.scope = options?.scope || ScopeEnum.Request;
    definition.createFrom = options?.createFrom;

    if (definition.srcPath) {
      debug(
        `[core]: bind id "${definition.name} (${definition.srcPath}) ${identifier}"`
      );
    } else {
      debug(`[core]: bind id "${definition.name}" ${identifier}`);
    }

    // inject properties
    const props = MetadataManager.getPropertiesWithMetadata(
      PROPERTY_INJECT_KEY,
      target
    );

    for (const p in props) {
      const propertyMeta: PropertyInjectMetadata = props[p];
      debugBind(
        `${' '.repeat(debugSpaceLength)}inject properties => [${JSON.stringify(
          propertyMeta
        )}]`
      );

      definition.properties.set(propertyMeta.targetKey, propertyMeta);
    }

    // inject custom properties
    const customProps = MetadataManager.getPropertiesWithMetadata(
      CUSTOM_PROPERTY_INJECT_KEY,
      target
    );

    for (const p in customProps) {
      for (const propertyMeta of customProps[p]) {
        definition.handlerProps.push(propertyMeta);
      }
    }

    // @async, @init, @destroy
    const objDefMetadata = MetadataManager.getPropertiesWithMetadata(
      OBJECT_DEFINITION_KEY,
      target
    );

    const objDefOptions = {} as Partial<IObjectDefinition>;
    for (const p in objDefMetadata) {
      Object.assign(objDefOptions, objDefMetadata[p][0]);
    }

    if (objDefOptions.initMethod) {
      debugBind(
        `${' '.repeat(debugSpaceLength)}register initMethod = ${
          objDefOptions.initMethod
        }`
      );
      definition.initMethod = objDefOptions.initMethod;
    }

    if (objDefOptions.destroyMethod) {
      debugBind(
        `${' '.repeat(debugSpaceLength)}register destroyMethod = ${
          objDefOptions.destroyMethod
        }`
      );
      definition.destroyMethod = objDefOptions.destroyMethod;
    }

    const scopeMetadata = MetadataManager.getOwnMetadata(SCOPE_KEY, target);

    if (scopeMetadata) {
      const { scope, allowDowngrade } = scopeMetadata;
      debugBind(`${' '.repeat(debugSpaceLength)}register scope = ${scope}`);
      definition.scope = scope;

      debugBind(
        `${' '.repeat(
          debugSpaceLength
        )}register allowDowngrade = ${allowDowngrade}`
      );
      definition.allowDowngrade = allowDowngrade;
    }

    this.objectCreateEventTarget.emit(
      ObjectLifeCycleEvent.BEFORE_BIND,
      target,
      {
        context: this,
        definition,
        replaceCallback: newDefinition => {
          definition = newDefinition;
        },
      }
    );

    if (definition) {
      this.registry.registerDefinition(definition.id, definition);
    }
  }

  protected bindModule(module: any, options: Partial<IObjectDefinition>) {
    if (Types.isClass(module)) {
      const providerId = DecoratorManager.getProviderUUId(module);
      if (providerId) {
        this.identifierMapping.saveClassRelation(module, options?.namespace);
        this.bind(providerId, module, options);
      } else {
        // no provide or js class must be skip
      }
    } else {
      const info: {
        id: ObjectIdentifier;
        provider: (context?: IMidwayContainer) => any;
        scope?: ScopeEnum;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Request;
        }
        const uuid = Utils.generateRandomId();
        this.identifierMapping.saveFunctionRelation(info.id, uuid);
        this.bind(uuid, module, {
          scope: info.scope,
          namespace: options.namespace,
          srcPath: options.srcPath,
          createFrom: options.createFrom,
        });
      }
    }
  }

  setFileDetector(fileDetector: IFileDetector) {
    this.fileDetector = fileDetector;
  }

  createChild(): IMidwayContainer {
    return new MidwayContainer(this);
  }

  public setAttr(key: string, value) {
    this.attrMap.set(key, value);
  }

  public getAttr<T>(key: string): T {
    return this.attrMap.get(key);
  }

  public getIdentifier(identifier: ClassType | string): string {
    if (typeof identifier !== 'string') {
      identifier = DecoratorManager.getProviderUUId(identifier);
    }
    return identifier;
  }

  protected getManagedResolverFactory() {
    if (!this._resolverFactory) {
      this._resolverFactory = new ManagedResolverFactory(this);
    }
    return this._resolverFactory;
  }

  async stop(): Promise<void> {
    await this.getManagedResolverFactory().destroyCache();
    this.registry.clearAll();
  }

  ready() {
    return this.loadDefinitions();
  }

  get<T>(identifier: ClassType<T> | string, args?: any[]): T {
    return this.getManagedResolverFactory().create(identifier, undefined, args);
  }

  async getAsync<T>(
    identifier: ClassType<T> | string,
    args?: any[]
  ): Promise<T> {
    return this.getManagedResolverFactory().createAsync(
      identifier,
      undefined,
      args
    );
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  registerObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  onBeforeBind(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        replaceCallback: (newDefinition: IObjectDefinition) => void;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_BIND, fn);
  }

  onBeforeObjectCreated(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        constructorArgs: any[];
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_CREATED, fn);
  }

  onObjectCreated<T>(
    fn: (
      ins: T,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
        replaceCallback: (ins: T) => void;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_CREATED, fn);
  }

  onObjectInit<T>(
    fn: (
      ins: T,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_INIT, fn);
  }

  onBeforeObjectDestroy<T>(
    fn: (
      ins: T,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_DESTROY, fn);
  }

  saveModule(key, module) {
    if (!this.moduleMap.has(key)) {
      this.moduleMap.set(key, new Set());
    }
    this.moduleMap.get(key).add(module);
  }

  listModule(key: string) {
    return Array.from(this.moduleMap.get(key) || {});
  }

  transformModule(moduleMap: Map<string, Set<any>>) {
    this.moduleMap = new Map(moduleMap);
  }

  hasNamespace(ns: string) {
    return this.namespaceSet.has(ns);
  }

  getNamespaceList() {
    return Array.from(this.namespaceSet);
  }

  hasDefinition(identifier: ObjectIdentifier) {
    return this.registry.hasDefinition(identifier);
  }

  hasObject(identifier: ObjectIdentifier) {
    return this.registry.hasObject(identifier);
  }

  getInstanceScope(instance: any): ScopeEnum | undefined {
    if (instance[CONTAINER_OBJ_SCOPE]) {
      return instance[CONTAINER_OBJ_SCOPE];
    }
    return undefined;
  }
}
