import {
  getProviderId,
  isProvide,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  PIPELINE_IDENTIFIER,
  saveClassMetadata,
  ScopeEnum,
  PRIVATE_META_DATA_KEY,
  generateProvideId,
  MAIN_MODULE_KEY,
  CONFIG_KEY,
  ALL,
  isAsyncFunction,
  isClass,
  isFunction,
  getConstructorInject,
  TAGGED_PROP,
  getObjectDefProps,
  INJECT_CLASS_KEY_PREFIX,
  DecoratorManager,
  ResolveFilter,
  isRegExp,
  getProviderUUId,
  getIdentifierMapping,
  hasIdentifierMapping,
  saveIdentifierMapping,
} from '@midwayjs/decorator';
import { ContainerConfiguration } from './configuration';
import { FUNCTION_INJECT_KEY } from '../common/constants';
import {
  IApplicationContext,
  IConfigService,
  IContainerConfiguration,
  IEnvironmentService,
  IInformationService,
  IMidwayContainer,
  IObjectDefinitionMetadata,
  REQUEST_CTX_KEY,
} from '../interface';
import { MidwayConfigService } from '../service/configService';
import { MidwayEnvironmentService } from '../service/environmentService';
import { pipelineFactory } from '../features/pipeline';
import { ResolverHandler } from './resolverHandler';
import { run } from '@midwayjs/glob';
import { BaseApplicationContext } from './applicationContext';
import * as util from 'util';
import { getOwnMetadata, recursiveGetPrototypeOf } from '../common/reflectTool';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { ManagedReference, ManagedValue } from './managed';
import { MidwayAspectService } from '../service/aspectService';
import { parsePrefix } from '../util';

const DEFAULT_PATTERN = ['**/**.ts', '**/**.tsx', '**/**.js'];
const DEFAULT_IGNORE_PATTERN = [
  '**/**.d.ts',
  '**/logs/**',
  '**/run/**',
  '**/public/**',
  '**/app/view/**',
  '**/app/views/**',
  '**/app/extend/**',
  '**/node_modules/**',
  '**/**.test.ts',
  '**/**.test.js',
  '**/__test__/**',
];

const globalDebugLogger = util.debuglog('midway:container');
let containerIdx = 0;

export function clearContainerCache() {
  MidwayContainer.parentDefinitionMetadata = null;
  MidwayContainer.parentApplicationContext = null;
}

export class MidwayContainer
  extends BaseApplicationContext
  implements IMidwayContainer
{
  public id: string;
  private debugLogger = globalDebugLogger;
  private definitionMetadataList = [];
  protected resolverHandler: ResolverHandler;
  // 仅仅用于兼容requestContainer的ctx
  protected ctx = {};
  private configurationMap: Map<string, IContainerConfiguration> = new Map();
  // 特殊处理，按照 main 加载
  private likeMainConfiguration: IContainerConfiguration[] = [];
  protected configService: IConfigService;
  protected environmentService: IEnvironmentService;
  protected informationService: IInformationService;
  protected aspectService;
  private directoryFilterArray: ResolveFilter[] = [];
  private attrMap: Map<string, any> = new Map();

  /**
   * 单个进程中上一次的 applicationContext 的 registry
   */
  static parentDefinitionMetadata: Map<string, IObjectDefinitionMetadata[]>;
  /**
   * 单进程中上一次的 applicationContext
   */
  static parentApplicationContext: IMidwayContainer;

  constructor(baseDir: string = process.cwd(), parent?: IApplicationContext) {
    super(baseDir, parent);
    this.id = '00' + this.createContainerIdx();
    if (!MidwayContainer.parentApplicationContext) {
      MidwayContainer.parentApplicationContext = this;
    }
  }

  protected createContainerIdx() {
    return containerIdx++;
  }

  init(): void {
    this.initService();

    this.resolverHandler = new ResolverHandler(
      this,
      this.getManagedResolverFactory()
    );
    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject(REQUEST_CTX_KEY, this.ctx);
  }

  initService() {
    this.environmentService = new MidwayEnvironmentService();
    this.configService = new MidwayConfigService(this);
    this.aspectService = new MidwayAspectService(this);
  }

  /**
   * load directory and traverse file to find bind class
   * @param opts
   */
  load(
    opts: {
      loadDir: string | string[];
      pattern?: string | string[];
      ignore?: string | string[];
    } = { loadDir: [] }
  ) {
    // 添加全局白名单
    this.midwayIdentifiers.push(PIPELINE_IDENTIFIER);

    this.debugLogger('main:create "Main Module" and "Main Configuration"');
    // create main module configuration
    const configuration = this.createConfiguration();
    configuration.namespace = MAIN_MODULE_KEY;
    this.debugLogger(`main:"Main Configuration" load from "${this.baseDir}"`);
    configuration.load(this.baseDir);
    // loadDir
    this.debugLogger('main:load directory');

    // auto load cache next time when loadDirectory invoked
    let loadDirKey = this.baseDir;
    const loadDirs = [].concat(opts.loadDir || []);
    MidwayContainer.parentDefinitionMetadata =
      MidwayContainer.parentDefinitionMetadata || new Map();

    if (loadDirs.length > 0) {
      loadDirKey = loadDirs.join('-');
    }

    // load configuration
    for (const [packageName, containerConfiguration] of this.configurationMap) {
      // 老版本 configuration 才加载
      if (containerConfiguration.newVersion === false) {
        // main 的需要 skip 掉
        if (containerConfiguration.namespace === MAIN_MODULE_KEY) {
          continue;
        }
        this.debugLogger(`main:load configuration from ${packageName}`);
        this.loadConfiguration(opts, containerConfiguration);
      }
    }
    for (const containerConfiguration of this.likeMainConfiguration) {
      // 老版本 configuration 才加载
      if (containerConfiguration.newVersion === false) {
        this.loadConfiguration(opts, containerConfiguration);
      }
    }

    if (MidwayContainer.parentDefinitionMetadata.has(loadDirKey)) {
      this.restoreDefinitions(
        MidwayContainer.parentDefinitionMetadata.get(loadDirKey)
      );
    } else {
      this.loadDirectory(opts);
      // 保存元信息最新的上下文中，供其他容器复用，减少重复扫描
      MidwayContainer.parentDefinitionMetadata.set(
        loadDirKey,
        this.getDefinitionMetaList()
      );
    }

    this.debugLogger('main:main configuration register import objects');
    this.registerImportObjects(configuration.getImportObjects());

    // register base config hook
    this.registerDataHandler(CONFIG_KEY, (key: string) => {
      if (key === ALL) {
        return this.getConfigService().getConfiguration();
      } else {
        return this.getConfigService().getConfiguration(key);
      }
    });
  }

  // 加载模块
  loadDirectory(opts: {
    loadDir: string | string[];
    pattern?: string | string[];
    ignore?: string | string[];
    namespace?: string;
  }) {
    const loadDirs = [].concat(opts.loadDir || []);

    for (const dir of loadDirs) {
      const fileResults = run(DEFAULT_PATTERN.concat(opts.pattern || []), {
        cwd: dir,
        ignore: DEFAULT_IGNORE_PATTERN.concat(opts.ignore || []),
      });

      for (const file of fileResults) {
        this.debugLogger(`\nmain:*********** binding "${file}" ***********`);
        this.debugLogger(`  namespace => "${opts.namespace}"`);

        if (this.directoryFilterArray.length) {
          for (const resolveFilter of this.directoryFilterArray) {
            if (typeof resolveFilter.pattern === 'string') {
              if (file.includes(resolveFilter.pattern)) {
                const exports = resolveFilter.ignoreRequire
                  ? undefined
                  : require(file);
                resolveFilter.filter(exports, file, this);
                continue;
              }
            } else if (isRegExp(resolveFilter.pattern)) {
              if ((resolveFilter.pattern as RegExp).test(file)) {
                const exports = resolveFilter.ignoreRequire
                  ? undefined
                  : require(file);
                resolveFilter.filter(exports, file, this);
                continue;
              }
            }

            const exports = require(file);
            // add module to set
            this.bindClass(exports, opts.namespace, file);
            this.debugLogger(`  binding "${file}" end`);
          }
        } else {
          const exports = require(file);
          // add module to set
          this.bindClass(exports, opts.namespace, file);
          this.debugLogger(`  binding "${file}" end`);
        }
      }
    }
  }

  bindClass(exports, namespace = '', filePath?: string) {
    if (isClass(exports) || isFunction(exports)) {
      this.bindModule(exports, namespace, filePath);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (isClass(module) || isFunction(module)) {
          this.bindModule(module, namespace, filePath);
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
    const definitionMeta = {} as IObjectDefinitionMetadata;
    this.definitionMetadataList.push(definitionMeta);

    if (isClass(identifier) || isFunction(identifier)) {
      options = target;
      target = identifier as any;
      identifier = this.getIdentifier(target);
      // 保存旧字符串 id 和 uuid 之间的映射，这里保存的是带 namespace，和 require 时不同
      saveIdentifierMapping(getProviderId(target), identifier);
    }

    if (isClass(target)) {
      definitionMeta.definitionType = 'object';
      const originIdentifier = identifier;
      identifier = this.getIdentifier(target);
      if (originIdentifier === identifier) {
        // 额外保存原始的类名 id
        saveIdentifierMapping(getProviderId(target), identifier);
      } else {
        // 自定义字符串 id
        saveIdentifierMapping(originIdentifier, identifier);
      }
    } else {
      definitionMeta.definitionType = 'function';
      if (!isAsyncFunction(target)) {
        definitionMeta.asynchronous = false;
      }
    }

    definitionMeta.path = target;
    definitionMeta.id = identifier;
    definitionMeta.srcPath = options?.srcPath || null;
    definitionMeta.namespace = options?.namespace || '';
    definitionMeta.scope = options?.scope || ScopeEnum.Request;
    definitionMeta.autowire = options?.isAutowire !== false;

    this.debugLogger(`  bind id => [${definitionMeta.id}]`);

    // inject constructArgs
    const constructorMetaData = getConstructorInject(target);
    if (constructorMetaData) {
      this.debugLogger(`inject constructor => length = ${target['length']}`);
      definitionMeta.constructorArgs = [];
      const maxLength = Math.max.apply(null, Object.keys(constructorMetaData));
      for (let i = 0; i < maxLength + 1; i++) {
        const propertyMeta = constructorMetaData[i];
        if (propertyMeta) {
          definitionMeta.constructorArgs.push({
            type: 'ref',
            value: propertyMeta[0].value,
            args: propertyMeta[0].args,
          });
        } else {
          definitionMeta.constructorArgs.push({
            type: 'value',
            value: propertyMeta?.[0].value,
          });
        }
      }
    }

    // inject properties
    const props = recursiveGetPrototypeOf(target);
    props.push(target);

    definitionMeta.properties = [];
    definitionMeta.handlerProps = [];
    for (const p of props) {
      const metaData = getOwnMetadata(TAGGED_PROP, p);

      if (metaData) {
        this.debugLogger(`  inject properties => [${Object.keys(metaData)}]`);
        for (const metaKey in metaData) {
          for (const propertyMeta of metaData[metaKey]) {
            // find legacy name mapping to uuid
            let mappingUUID = propertyMeta.value;
            if (hasIdentifierMapping(mappingUUID)) {
              mappingUUID = getIdentifierMapping(mappingUUID);
            }
            definitionMeta.properties.push({
              metaKey,
              args: propertyMeta.args,
              value: mappingUUID,
            });
          }
        }
      }

      const meta = getOwnMetadata(INJECT_CLASS_KEY_PREFIX, p) as any;
      if (meta) {
        for (const [key, vals] of meta) {
          if (Array.isArray(vals)) {
            for (const val of vals) {
              if (
                val.key !== undefined &&
                val.key !== null &&
                typeof val.propertyName === 'string'
              ) {
                definitionMeta.handlerProps.push({
                  handlerKey:
                    DecoratorManager.removeDecoratorClassKeySuffix(key),
                  prop: val,
                });
              }
            }
          }
        }
      }
    }

    this.convertOptionsToDefinition(options, definitionMeta);
    // 对象自定义的annotations可以覆盖默认的属性
    this.registerCustomBinding(definitionMeta, target);

    // 把源信息变成真正的对象定义
    this.restoreDefinition(definitionMeta);
  }

  protected restoreDefinition(definitionMeta: IObjectDefinitionMetadata) {
    let definition;
    if (definitionMeta.definitionType === 'object') {
      definition = new ObjectDefinition();
    } else {
      definition = new FunctionDefinition();
      if (!definitionMeta.asynchronous) {
        definition.asynchronous = false;
      }
    }

    definition.path = definitionMeta.path;
    definition.id = definitionMeta.id;
    definition.srcPath = definitionMeta.srcPath;
    definition.namespace = definitionMeta.namespace;

    this.debugLogger(`  bind id => [${definition.id}]`);

    // inject constructArgs
    if (
      definitionMeta.constructorArgs &&
      definitionMeta.constructorArgs.length
    ) {
      for (const constructorInfo of definitionMeta.constructorArgs) {
        if (constructorInfo.type === 'ref') {
          const refManagedIns = new ManagedReference();
          const name = constructorInfo.value;
          refManagedIns.args = constructorInfo.args;
          if (this.midwayIdentifiers.includes(name)) {
            refManagedIns.name = name;
          } else {
            refManagedIns.name = generateProvideId(name, definition.namespace);
          }
          definition.constructorArgs.push(refManagedIns);
        } else {
          // inject empty value
          const valueManagedIns = new ManagedValue();
          valueManagedIns.valueType = constructorInfo.type;
          valueManagedIns.value = constructorInfo.value;
          definition.constructorArgs.push(valueManagedIns);
        }
      }
    }

    // inject properties
    for (const propertyMeta of definitionMeta.properties) {
      const refManaged = new ManagedReference();
      refManaged.args = propertyMeta.args;
      if (this.midwayIdentifiers.includes(propertyMeta.value)) {
        refManaged.name = propertyMeta.value;
      } else {
        refManaged.name = generateProvideId(
          propertyMeta.value,
          definition.namespace
        );
      }
      definition.properties.set(propertyMeta.metaKey, refManaged);
    }

    definition.asynchronous = definitionMeta.asynchronous;
    definition.initMethod = definitionMeta.initMethod;
    definition.destroyMethod = definitionMeta.destroyMethod;
    definition.scope = definitionMeta.scope;
    definition.autowire = definitionMeta.autowire;
    definition.handlerProps = definitionMeta.handlerProps;

    this.registerDefinition(definitionMeta.id, definition);
  }

  protected restoreDefinitions(definitionMetadataList) {
    if (definitionMetadataList && definitionMetadataList.length) {
      for (const definitionMeta of definitionMetadataList) {
        this.restoreDefinition(definitionMeta);
      }
    }
  }

  protected getDefinitionMetaList() {
    return this.definitionMetadataList;
  }

  protected bindModule(module, namespace = '', filePath?: string) {
    if (isClass(module)) {
      const providerId = isProvide(module) ? getProviderUUId(module) : null;
      if (providerId) {
        if (namespace) {
          saveClassMetadata(
            PRIVATE_META_DATA_KEY,
            { namespace, providerId, srcPath: filePath },
            module
          );
        }
        // 保存旧字符串 id 和 uuid 之间的映射
        const generatedProvideId = generateProvideId(
          getProviderId(module),
          namespace
        );
        saveIdentifierMapping(generatedProvideId, providerId);
        this.bind(providerId, module, {
          namespace,
          srcPath: filePath,
        });
      } else {
        // no provide or js class must be skip
      }
    } else {
      const info: {
        id: ObjectIdentifier;
        provider: (context?: IApplicationContext) => any;
        scope?: ScopeEnum;
        isAutowire?: boolean;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Request;
        }
        this.bind(generateProvideId(info.id, namespace), module, {
          scope: info.scope,
          isAutowire: info.isAutowire,
          namespace,
          srcPath: filePath,
        });
      }
    }
  }

  createChild(baseDir?: string): IMidwayContainer {
    return new MidwayContainer(baseDir || this.baseDir, this);
  }

  registerDataHandler(handlerType: string, handler: (...args) => any) {
    this.resolverHandler.registerHandler(handlerType, handler);
  }

  registerCustomBinding(objectDefinition, target) {
    // @async, @init, @destroy @scope
    const objDefOptions: ObjectDefinitionOptions = getObjectDefProps(target);
    this.convertOptionsToDefinition(objDefOptions, objectDefinition);

    if (objectDefinition && !objectDefinition.scope) {
      this.debugLogger('  @scope => request');
      objectDefinition.scope = ScopeEnum.Request;
    }
  }

  registerObject(identifier: ObjectIdentifier, target: any) {
    this.midwayIdentifiers.push(identifier);
    if (this?.getCurrentNamespace()) {
      if (this?.getCurrentNamespace() === MAIN_MODULE_KEY) {
        // 如果是 main，则同步 alias 到所有的 namespace
        for (const value of this.configurationMap.values()) {
          if (value.namespace !== MAIN_MODULE_KEY) {
            const key =
              identifier.indexOf(value.namespace + ':') > -1
                ? identifier
                : value.namespace + ':' + identifier;
            super.registerObject(key, target);
          }
        }
      } else {
        const key =
          identifier.indexOf(this.getCurrentNamespace() + ':') > -1
            ? identifier
            : this.getCurrentNamespace() + ':' + identifier;
        identifier = key;
      }
    }
    return super.registerObject(identifier, target);
  }

  createConfiguration(): IContainerConfiguration {
    return new ContainerConfiguration(this);
  }

  addConfiguration(configuration: IContainerConfiguration) {
    if (configuration.namespace === '') {
      this.likeMainConfiguration.push(configuration);
    } else {
      this.configurationMap.set(configuration.packageName, configuration);
    }
  }

  containsConfiguration(namespace: string): boolean {
    return this.configurationMap.has(namespace);
  }

  getConfigService() {
    return this.configService;
  }

  getEnvironmentService() {
    return this.environmentService;
  }

  getInformationService() {
    return this.informationService;
  }

  setInformationService(informationService) {
    this.informationService = informationService;
  }

  getAspectService() {
    return this.aspectService;
  }

  getCurrentEnv() {
    return this.environmentService.getCurrentEnvironment();
  }

  protected getCurrentNamespace(): string {
    return '';
  }

  resolve<T>(target: T): T {
    const tempContainer = new MidwayContainer();
    tempContainer.bind<T>(target);
    tempContainer.parent = this;
    return tempContainer.get<T>(target);
  }

  get<T>(identifier: any, args?: any): T {
    // 处理传入类，获取 uuid
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    } else {
      // 处理字符串返回明确的缓存的对象
      if (this.registry.hasObject(identifier)) {
        return this.findRegisterObject(identifier);
      }
    }

    identifier = parsePrefix(identifier);

    // 处理传入的如果是老的字符串 id，找到 uuid
    if (hasIdentifierMapping(identifier)) {
      identifier = getIdentifierMapping(identifier);
    }

    if (this.registry.hasObject(identifier)) {
      return this.findRegisterObject(identifier);
    }
    const ins: any = super.get<T>(identifier, args);
    return this.aspectService.wrapperAspectToInstance(ins);
  }

  async getAsync<T>(identifier: any, args?: any): Promise<T> {
    // 处理传入类，获取 uuid
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    } else {
      // 处理字符串返回明确的缓存的对象
      if (this.registry.hasObject(identifier)) {
        return this.findRegisterObject(identifier);
      }
    }

    identifier = parsePrefix(identifier);

    // 处理传入的如果是老的字符串 id，找到 uuid
    if (hasIdentifierMapping(identifier)) {
      identifier = getIdentifierMapping(identifier);
    }

    if (this.registry.hasObject(identifier)) {
      return this.findRegisterObject(identifier);
    }

    const ins: any = await super.getAsync<T>(identifier, args);
    return this.aspectService.wrapperAspectToInstance(ins);
  }

  protected getIdentifier(target: any) {
    return getProviderUUId(target);
  }

  protected findRegisterObject(identifier) {
    const ins = this.registry.getObject(identifier);
    return this.aspectService.wrapperAspectToInstance(ins);
  }

  async ready() {
    if (this.readied) return;
    await super.ready();
    // 加载配置
    await this.configService.load();
  }

  async stop(): Promise<void> {
    await super.stop();
  }
  /**
   * 注册 importObjects
   * @param objs configuration 中的 importObjects
   * @param namespace namespace
   */
  private registerImportObjects(objs: any, namespace?: string) {
    if (objs) {
      const keys = Object.keys(objs);
      for (const key of keys) {
        if (typeof objs[key] !== undefined) {
          this.registerObject(generateProvideId(key, namespace), objs[key]);
        }
      }
    }
  }
  /**
   * 初始化默认需要 bind 到 container 中的基础依赖
   */
  loadDefinitions() {
    // 默认加载 pipeline
    this.bindModule(pipelineFactory);
  }

  private loadConfiguration(
    opts: any,
    containerConfiguration: IContainerConfiguration
  ) {
    const subDirs = containerConfiguration.getImportDirectory();
    if (subDirs && subDirs.length > 0) {
      this.debugLogger(
        'load configuration dir => %j, namespace => %s.',
        subDirs,
        containerConfiguration.namespace
      );
      this.loadDirectory({
        ...opts,
        loadDir: subDirs,
        namespace: containerConfiguration.namespace,
      });
    }

    this.registerImportObjects(
      containerConfiguration.getImportObjects(),
      containerConfiguration.namespace
    );
  }

  private convertOptionsToDefinition(
    options: ObjectDefinitionOptions,
    definition: IObjectDefinitionMetadata
  ) {
    if (options) {
      if (options.isAsync) {
        this.debugLogger('  register isAsync = true');
        definition.asynchronous = true;
      }

      if (options.initMethod) {
        this.debugLogger(`  register initMethod = ${options.initMethod}`);
        definition.initMethod = options.initMethod;
      }

      if (options.destroyMethod) {
        this.debugLogger(`  register destroyMethod = ${options.destroyMethod}`);
        definition.destroyMethod = options.destroyMethod;
      }

      if (options.scope) {
        this.debugLogger(`  register scope = ${options.scope}`);
        definition.scope = options.scope;
      }

      if (options.constructorArgs) {
        this.debugLogger(
          `  register constructorArgs = ${options.constructorArgs}`
        );
        definition.constructorArgs = options.constructorArgs;
      }

      if (options.isAutowire === false) {
        this.debugLogger(`  register autowire = ${options.isAutowire}`);
        definition.autowire = false;
      } else if (options.isAutowire === true) {
        this.debugLogger(`  register autowire = ${options.isAutowire}`);
        definition.autowire = true;
      }
    }
  }

  public getResolverHandler() {
    return this.resolverHandler;
  }

  public addDirectoryFilter(directoryFilter) {
    this.directoryFilterArray =
      this.directoryFilterArray.concat(directoryFilter);
  }

  public setAttr(key: string, value) {
    this.attrMap.set(key, value);
  }

  public getAttr<T>(key: string): T {
    return this.attrMap.get(key);
  }
}
