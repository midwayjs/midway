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
  ObjectDefinitionOptions,
  ObjectIdentifier,
  saveModule,
  saveProviderId,
  ScopeEnum,
  getProviderUUId,
  generateRandomId,
  getPropertyInject,
  getObjectDefinition,
  getClassExtendedMetadata,
  INJECT_CUSTOM_TAG,
} from '@midwayjs/decorator';
import { FunctionalConfiguration } from '../functional/configuration';
import * as util from 'util';
import { ObjectDefinitionRegistry } from './definitionRegistry';
import {
  IConfigService,
  IEnvironmentService,
  IFileDetector,
  IIdentifierRelationShip,
  IInformationService,
  IMidwayContainer,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  REQUEST_CTX_KEY,
} from '../interface';
import { FUNCTION_INJECT_KEY } from '../common/constants';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { ResolverHandler } from './resolverHandler';
import {
  ManagedReference,
  ManagedResolverFactory,
} from './managedResolverFactory';
import { NotFoundError } from '../common/notFoundError';
import { MidwayEnvironmentService } from '../service/environmentService';
import { MidwayConfigService } from '../service/configService';

const debug = util.debuglog('midway:container:configuration');
const globalDebugLogger = util.debuglog('midway:container');

class ContainerConfiguration {
  loadedMap = new WeakMap();
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

      debug('   configuration export %j.', configurationOptions);
      if (configurationOptions) {
        if (configurationOptions.namespace !== undefined) {
          namespace = configurationOptions.namespace;
        }
        this.addImports(configurationOptions.imports);
        this.addImportObjects(configurationOptions.importObjects);
        this.addImportConfigs(configurationOptions.importConfigs);
        this.bindConfigurationClass(configurationExport, namespace);
      }
    }

    // bind module
    this.container.bindClass(module, namespace);
  }

  addImportConfigs(importConfigs: string[]) {
    if (importConfigs && importConfigs.length) {
      debug('   import configs %j".', importConfigs);
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
        debug(
          '\n---------- start load configuration from submodule" ----------'
        );
        this.load(importPackage);
        debug(
          `---------- end load configuration from sub package "${importPackage}" ----------`
        );
      } else if ('component' in importPackage) {
        if (
          (importPackage as IComponentInfo)?.enabledEnvironment?.includes(
            this.container.get(MidwayEnvironmentService).getCurrentEnvironment()
          )
        ) {
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
}

export class MidwayContainer implements IMidwayContainer {
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: IObjectDefinitionRegistry = null;
  private _identifierMapping = null;
  public parent: IMidwayContainer = null;
  private debugLogger = globalDebugLogger;
  protected resolverHandler: ResolverHandler;
  // 仅仅用于兼容requestContainer的ctx
  protected ctx = {};
  protected configService: IConfigService;
  protected environmentService: IEnvironmentService;
  protected informationService: IInformationService;
  protected aspectService;
  private fileDetector: IFileDetector;
  private attrMap: Map<string, any> = new Map();
  private isLoad = false;

  constructor(parent?: IMidwayContainer) {
    this.parent = parent;
    this.init();
  }

  protected init() {
    this.resolverHandler = new ResolverHandler(
      this,
      this.managedResolverFactory
    );
    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject(REQUEST_CTX_KEY, this.ctx);
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

  load(module?) {
    this.isLoad = true;
    if (module) {
      // load configuration
      const configuration = new ContainerConfiguration(this);
      configuration.load(module);
    }
  }

  protected loadDefinitions() {
    if (!this.isLoad) {
      this.load();
    }
    // load project file
    this.fileDetector?.run(this);
  }

  bindClass(exports, namespace = '', filePath?: string) {
    if (isClass(exports) || isFunction(exports)) {
      this.bindModule(exports, {
        namespace,
        srcPath: filePath,
      });
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (isClass(module) || isFunction(module)) {
          this.bindModule(module, {
            namespace,
            srcPath: filePath,
          });
        }
      }
    }
  }

  bind<T>(target: T, options?: ObjectDefinitionOptions): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
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
    } else {
      definition = new FunctionDefinition();
      if (!isAsyncFunction(target)) {
        definition.asynchronous = false;
      }
    }

    definition.path = target;
    definition.id = identifier;
    definition.srcPath = options?.srcPath || null;
    definition.namespace = options?.namespace || '';
    definition.scope = options?.scope || ScopeEnum.Request;

    this.debugLogger(`  bind id => [${definition.id}]`);

    // inject properties
    const props = getPropertyInject(target);

    for (const p in props) {
      const propertyMeta = props[p];
      this.debugLogger(`  inject properties => [${propertyMeta}]`);
      const refManaged = new ManagedReference();
      refManaged.args = propertyMeta.args;
      refManaged.name = propertyMeta.value as any;
      definition.properties.set(propertyMeta['targetKey'], refManaged);
    }

    // inject custom properties
    const customProps = getClassExtendedMetadata(INJECT_CUSTOM_TAG, target);

    for (const p in customProps) {
      const propertyMeta = customProps[p] as any;
      definition.handlerProps.push({
        handlerKey: propertyMeta.key,
        prop: propertyMeta,
      });
    }

    // @async, @init, @destroy @scope
    const objDefOptions: ObjectDefinitionOptions =
      getObjectDefinition(target) ?? {};

    if (objDefOptions.initMethod) {
      this.debugLogger(`  register initMethod = ${objDefOptions.initMethod}`);
      definition.initMethod = objDefOptions.initMethod;
    }

    if (objDefOptions.destroyMethod) {
      this.debugLogger(
        `  register destroyMethod = ${objDefOptions.destroyMethod}`
      );
      definition.destroyMethod = objDefOptions.destroyMethod;
    }

    if (objDefOptions.scope) {
      this.debugLogger(`  register scope = ${objDefOptions.scope}`);
      definition.scope = objDefOptions.scope;
    }

    this.registry.registerDefinition(definition.id, definition);
  }

  protected bindModule(module: any, options: ObjectDefinitionOptions = {}) {
    if (isClass(module)) {
      const providerId = getProviderUUId(module);
      if (providerId) {
        this.identifierMapping.saveClassRelation(module, options.namespace);
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
        });
      }
    }
  }

  getDebugLogger() {
    return this.debugLogger;
  }

  setFileDetector(fileDetector: IFileDetector) {
    this.fileDetector = fileDetector;
  }

  createChild(): IMidwayContainer {
    return new MidwayContainer(this);
  }

  registerDataHandler(handlerType: string, handler: (...args) => any) {
    this.resolverHandler.registerHandler(handlerType, handler);
  }

  public getResolverHandler() {
    return this.resolverHandler;
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

  protected findRegisterObject(identifier) {
    const ins = this.registry.getObject(identifier);
    return this.aspectService.wrapperAspectToInstance(ins);
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

  get<T>(identifier: { new (...args): T }, args?: any): T;
  get<T>(identifier: ObjectIdentifier, args?: any): T;
  get(identifier: any, args?: any): any {
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
      throw new NotFoundError(identifier);
    }
    return this.getManagedResolverFactory().create({ definition, args });
  }

  async getAsync<T>(identifier: { new (...args): T }, args?: any): Promise<T>;
  async getAsync<T>(identifier: ObjectIdentifier, args?: any): Promise<T>;
  async getAsync(identifier: any, args?: any): Promise<any> {
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
      throw new NotFoundError(identifier);
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

  /**
   * register handler after instance create
   * @param fn
   */
  afterEachCreated(
    fn: (
      ins: any,
      context: IMidwayContainer,
      definition?: IObjectDefinition
    ) => void
  ) {
    this.managedResolverFactory.afterEachCreated(fn);
  }

  /**
   * register handler before instance create
   * @param fn
   */
  beforeEachCreated(
    fn: (Clzz: any, constructorArgs: any[], context: IMidwayContainer) => void
  ) {
    this.managedResolverFactory.beforeEachCreated(fn);
  }
}
