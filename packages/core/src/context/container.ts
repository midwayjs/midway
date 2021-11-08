import {
  CONFIGURATION_KEY,
  getClassMetadata,
  IComponentInfo,
  InjectionConfigurationOptions,
  isAsyncFunction,
  isClass,
  isFunction,
  listModule,
  MAIN_MODULE_KEY,
  ObjectIdentifier,
  saveModule,
  saveProviderId,
  ScopeEnum,
  getProviderUUId,
  generateRandomId,
  getPropertyInject,
  getObjectDefinition,
  getClassExtendedMetadata,
  INJECT_CUSTOM_PROPERTY,
  getProviderName,
  IModuleStore,
} from '@midwayjs/decorator';
import { FunctionalConfiguration } from '../functional/configuration';
import * as util from 'util';
import { ObjectDefinitionRegistry } from './definitionRegistry';
import {
  IFileDetector,
  IIdentifierRelationShip,
  IMidwayContainer,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  ObjectContext,
  ObjectLifeCycleEvent,
  REQUEST_CTX_KEY,
} from '../interface';
import { FUNCTION_INJECT_KEY } from '../common/constants';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import {
  ManagedReference,
  ManagedResolverFactory,
} from './managedResolverFactory';
import { MidwayEnvironmentService } from '../service/environmentService';
import { MidwayConfigService } from '../service/configService';
import * as EventEmitter from 'events';
import { MidwayDefinitionNotFoundError } from '../error';

const debug = util.debuglog('midway:debug');
const debugBind = util.debuglog('midway:bind');

class ContainerConfiguration {
  private loadedMap = new WeakMap();
  private namespaceList = [];
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
        configurationOptions = getClassMetadata(
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
        debug(`[core]: load configuration in namespace="${namespace}"`);
        this.addImports(configurationOptions.imports);
        this.addImportObjects(configurationOptions.importObjects);
        this.addImportConfigs(configurationOptions.importConfigs);
        this.bindConfigurationClass(configurationExport, namespace);
      }
    }

    // bind module
    this.container.bindClass(module, {
      namespace,
    });
  }

  addImportConfigs(importConfigs: string[]) {
    if (importConfigs && importConfigs.length) {
      this.container.get(MidwayConfigService).add(importConfigs);
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
      saveProviderId(undefined, clzz);
      const id = getProviderUUId(clzz);
      this.container.bind(id, clzz, {
        namespace: namespace,
        scope: ScopeEnum.Singleton,
      });
    }

    // configuration 手动绑定去重
    const configurationMods = listModule(CONFIGURATION_KEY);
    const exists = configurationMods.find(mod => {
      return mod.target === clzz;
    });
    if (!exists) {
      saveModule(CONFIGURATION_KEY, {
        target: clzz,
        namespace: namespace,
      });
    }
  }

  private getConfigurationExport(exports): any[] {
    const mods = [];
    if (
      isClass(exports) ||
      isFunction(exports) ||
      exports instanceof FunctionalConfiguration
    ) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (
          isClass(module) ||
          isFunction(module) ||
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
}

class ObjectCreateEventTarget extends EventEmitter {}

export class MidwayContainer implements IMidwayContainer, IModuleStore {
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: IObjectDefinitionRegistry = null;
  private _identifierMapping = null;
  private moduleMap = null;
  private _objectCreateEventTarget: EventEmitter;
  public parent: IMidwayContainer = null;
  // 仅仅用于兼容requestContainer的ctx
  protected ctx = {};
  private fileDetector: IFileDetector;
  private attrMap: Map<string, any> = new Map();
  private _namespaceSet: Set<string> = null;
  private isLoad = false;

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
      this._objectCreateEventTarget = new ObjectCreateEventTarget();
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

  get managedResolverFactory() {
    if (!this._resolverFactory) {
      this._resolverFactory = new ManagedResolverFactory(this);
    }
    return this._resolverFactory;
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

  load(module?) {
    this.isLoad = true;
    if (module) {
      // load configuration
      const configuration = new ContainerConfiguration(this);
      configuration.load(module);
      for (const ns of configuration.getNamespaceList()) {
        this.namespaceSet.add(ns);
      }
    }
  }

  protected loadDefinitions() {
    if (!this.isLoad) {
      this.load();
    }
    // load project file
    this.fileDetector?.run(this);
  }

  bindClass(exports, options?: Partial<IObjectDefinition>) {
    if (isClass(exports) || isFunction(exports)) {
      this.bindModule(exports, options);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (isClass(module) || isFunction(module)) {
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
    if (isClass(identifier) || isFunction(identifier)) {
      return this.bindModule(identifier, target);
    }

    if (this.registry.hasDefinition(identifier)) {
      // 如果 definition 存在就不再重复 bind
      return;
    }

    let definition;
    if (isClass(target)) {
      definition = new ObjectDefinition();
      definition.name = getProviderName(target);
    } else {
      definition = new FunctionDefinition();
      if (!isAsyncFunction(target)) {
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
      debug(`[core]: bind id "${definition.name} (${definition.srcPath})"`);
    } else {
      debug(`[core]: bind id "${definition.name}"`);
    }

    // inject properties
    const props = getPropertyInject(target);

    for (const p in props) {
      const propertyMeta = props[p];
      debugBind(`  inject properties => [${JSON.stringify(propertyMeta)}]`);
      const refManaged = new ManagedReference();
      refManaged.args = propertyMeta.args;
      refManaged.name = propertyMeta.value as any;
      definition.properties.set(propertyMeta['targetKey'], refManaged);
    }

    // inject custom properties
    const customProps = getClassExtendedMetadata(
      INJECT_CUSTOM_PROPERTY,
      target
    );

    for (const p in customProps) {
      const propertyMeta = customProps[p] as {
        propertyName: string;
        key: string;
        metadata: any;
      };
      definition.handlerProps.push(propertyMeta);
    }

    // @async, @init, @destroy @scope
    const objDefOptions = getObjectDefinition(target) ?? {};

    if (objDefOptions.initMethod) {
      debugBind(`  register initMethod = ${objDefOptions.initMethod}`);
      definition.initMethod = objDefOptions.initMethod;
    }

    if (objDefOptions.destroyMethod) {
      debugBind(`  register destroyMethod = ${objDefOptions.destroyMethod}`);
      definition.destroyMethod = objDefOptions.destroyMethod;
    }

    if (objDefOptions.scope) {
      debugBind(`  register scope = ${objDefOptions.scope}`);
      definition.scope = objDefOptions.scope;
    }

    this.objectCreateEventTarget.emit(ObjectLifeCycleEvent.AFTER_BIND, target, {
      context: this,
      definition,
    });

    this.registry.registerDefinition(definition.id, definition);
  }

  protected bindModule(module: any, options: Partial<IObjectDefinition>) {
    if (isClass(module)) {
      const providerId = getProviderUUId(module);
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
        const uuid = generateRandomId();
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

  protected getIdentifier(target: any) {
    return getProviderUUId(target);
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

  async ready(): Promise<void> {
    await this.loadDefinitions();
  }

  get<T>(
    identifier: { new (...args): T },
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  get<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  get(identifier: any, args?: any[], objectContext?: ObjectContext): any {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }
    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.get(identifier, args);
    }
    if (!definition) {
      throw new MidwayDefinitionNotFoundError(
        objectContext?.originName ?? identifier
      );
    }
    return this.getManagedResolverFactory().create({ definition, args });
  }

  async getAsync<T>(
    identifier: { new (...args): T },
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
  async getAsync<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
  async getAsync(
    identifier: any,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<any> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.getAsync(identifier, args);
    }

    if (!definition) {
      throw new MidwayDefinitionNotFoundError(
        objectContext?.originName ?? identifier
      );
    }

    return this.getManagedResolverFactory().createAsync({ definition, args });
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  registerObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  onAfterBind(
    fn: (
      Clzz: any,
      options: {
        context: IMidwayContainer;
        definition: IObjectDefinition;
      }
    ) => void
  ) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_BIND, fn);
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

  hasDefinition(identifier: ObjectIdentifier) {
    return this.registry.hasDefinition(identifier);
  }

  hasObject(identifier: ObjectIdentifier) {
    return this.registry.hasObject(identifier);
  }
}
