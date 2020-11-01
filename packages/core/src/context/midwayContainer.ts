import {
  AspectMetadata,
  CONFIGURATION_KEY,
  getProviderId,
  IMethodAspect,
  isProvide,
  listModule,
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
  getClassMetadata,
  ASPECT_KEY,
} from '@midwayjs/decorator';
import { ContainerConfiguration } from './configuration';
import { FUNCTION_INJECT_KEY } from '../common/constants';
import {
  IApplicationContext,
  IConfigService,
  IContainerConfiguration,
  IEnvironmentService,
  ILifeCycle,
  IMidwayContainer,
  IObjectDefinitionMetadata,
  REQUEST_CTX_KEY,
} from '../interface';
import { MidwayConfigService } from '../service/configService';
import { MidwayEnvironmentService } from '../service/environmentService';
import { pipelineFactory } from '../features/pipeline';
import { ResolverHandler } from './resolverHandler';
import { run } from '@midwayjs/glob';
import * as pm from 'picomatch';
import { BaseApplicationContext } from './applicationContext';
import * as util from 'util';
import { recursiveGetMetadata } from '../common/reflectTool';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { ManagedReference, ManagedValue } from './managed';

const DEFAULT_PATTERN = ['**/**.ts', '**/**.tsx', '**/**.js'];
const DEFAULT_IGNORE_PATTERN = [
  '**/**.d.ts',
  '**/logs/**',
  '**/run/**',
  '**/public/**',
  '**/view/**',
  '**/views/**',
  '**/app/extend/**',
];

const globalDebugLogger = util.debuglog('midway:container');
let containerIdx = 0;

export class MidwayContainer
  extends BaseApplicationContext
  implements IMidwayContainer {
  public id: string;
  private debugLogger = globalDebugLogger;
  private definitionMetadataList = [];
  protected resolverHandler: ResolverHandler;
  // 仅仅用于兼容requestContainer的ctx
  private ctx = {};
  private configurationMap: Map<string, IContainerConfiguration> = new Map();
  // 特殊处理，按照 main 加载
  private likeMainConfiguration: IContainerConfiguration[] = [];
  public configService: IConfigService;
  public environmentService: IEnvironmentService;
  public aspectMappingMap: WeakMap<object, Map<string, any[]>>;
  private aspectModuleSet: Set<any>;

  /**
   * 单个进程中上一次的 applicationContext 的 registry
   */
  static parentDefinitionMetadata: Map<string, IObjectDefinitionMetadata[]>;

  constructor(baseDir: string = process.cwd(), parent?: IApplicationContext) {
    super(baseDir, parent);
    this.id = '00' + this.createContainerIdx();
  }

  protected createContainerIdx() {
    return containerIdx++;
  }

  init(): void {
    this.aspectMappingMap = new WeakMap();
    this.aspectModuleSet = new Set();

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

    // register ad base config hook
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
        const exports = require(file);
        // add module to set
        this.bindClass(exports, opts.namespace, file);
        this.debugLogger(`  binding "${file}" end`);
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
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: ObjectDefinitionOptions
  ): void {
    const definitionMeta = {} as IObjectDefinitionMetadata;
    this.definitionMetadataList.push(definitionMeta);

    if (isClass(identifier) || isFunction(identifier)) {
      options = target;
      target = identifier as any;
      identifier = this.getIdentifier(target);
      options = null;
    }

    if (isClass(target)) {
      definitionMeta.definitionType = 'object';
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
    definitionMeta.scope = options?.scope || ScopeEnum.Singleton;
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
    const metaDatas = recursiveGetMetadata(TAGGED_PROP, target);
    definitionMeta.properties = [];
    for (const metaData of metaDatas) {
      this.debugLogger(`  inject properties => [${Object.keys(metaData)}]`);
      for (const metaKey in metaData) {
        for (const propertyMeta of metaData[metaKey]) {
          definitionMeta.properties.push({
            metaKey,
            args: propertyMeta.args,
            value: propertyMeta.value,
          });
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
      const providerId = isProvide(module) ? getProviderId(module) : null;
      if (providerId) {
        if (namespace) {
          saveClassMetadata(PRIVATE_META_DATA_KEY, { namespace }, module);
        }
        this.bind(generateProvideId(providerId, namespace), module, {
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

    if (objDefOptions && !objDefOptions.scope) {
      this.debugLogger('  @scope => request');
      objectDefinition.scope = ScopeEnum.Request;
    }
  }

  registerObject(
    identifier: ObjectIdentifier,
    target: any,
    registerByUser = true
  ) {
    if (registerByUser) {
      this.midwayIdentifiers.push(identifier);
    }
    if (this?.getCurrentNamespace()) {
      if (this?.getCurrentNamespace() === MAIN_MODULE_KEY) {
        // 如果是 main，则同步 alias 到所有的 namespace
        for (const value of this.configurationMap.values()) {
          if (value.namespace !== MAIN_MODULE_KEY) {
            super.registerObject(value.namespace + ':' + identifier, target);
          }
        }
      } else {
        identifier = this.getCurrentNamespace() + ':' + identifier;
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
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    return super.get(identifier, args);
  }

  async getAsync<T>(identifier: any, args?: any): Promise<T> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }
    const ins: any = await super.getAsync<T>(identifier, args);
    let proxy = null;
    if (ins?.constructor && this.aspectMappingMap.has(ins.constructor)) {
      // 动态处理拦截器
      const methodAspectCollection = this.aspectMappingMap.get(ins.constructor);
      proxy = new Proxy(ins, {
        get: (obj, prop) => {
          if (typeof prop === 'string' && methodAspectCollection.has(prop)) {
            const aspectFn = methodAspectCollection.get(prop);
            return aspectFn[0](ins, obj[prop]);
          }
          return obj[prop];
        },
      });
    }
    return proxy || ins;
  }

  protected getIdentifier(target: any) {
    return getProviderId(target);
  }

  async ready() {
    await super.ready();
    if (this.configService) {
      // 加载配置
      await this.configService.load();
    }

    await this.loadAspect();
  }

  async stop(): Promise<void> {
    const cycles: Array<{ target: any; namespace: string }> = listModule(
      CONFIGURATION_KEY
    );
    this.debugLogger(
      'load lifecycle length => %s when stop.',
      cycles && cycles.length
    );
    for (const cycle of cycles) {
      const providerId = getProviderId(cycle.target);
      this.debugLogger('onStop lifecycle id => %s.', providerId);
      const inst = await this.getAsync<ILifeCycle>(providerId);
      if (inst.onStop && typeof inst.onStop === 'function') {
        await inst.onStop(this);
      }
    }

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

  /**
   * load aspect method for container
   * @private
   */
  private async loadAspect() {
    // for aop implementation
    const aspectModules = listModule(ASPECT_KEY);
    // sort for aspect target
    let aspectDataList = [];
    for (const module of aspectModules) {
      const data = getClassMetadata(ASPECT_KEY, module);
      aspectDataList = aspectDataList.concat(
        data.map(el => {
          el.aspectModule = module;
          return el;
        })
      );
    }

    // sort priority
    aspectDataList.sort((pre, next) => {
      return (next.priority || 0) - (pre.priority || 0);
    });

    for (const aspectData of aspectDataList) {
      const aspectIns = await this.getAsync<IMethodAspect>(
        aspectData.aspectModule
      );
      await this.addAspect(aspectIns, aspectData);
    }

    // 合并拦截器方法，提升性能
    for (const module of this.aspectModuleSet) {
      const aspectMapping = this.aspectMappingMap.get(module);
      for (const [method, aspectFn] of aspectMapping) {
        const composeFn = (ins, originMethod) => {
          for (const fn of aspectFn) {
            originMethod = fn(ins, originMethod);
          }
          return originMethod;
        };
        aspectMapping.set(method, [composeFn]);
      }
    }
    // 绑定完后清理 set 记录
    this.aspectModuleSet.clear();
  }

  public async addAspect(aspectIns: IMethodAspect, aspectData: AspectMetadata) {
    const module = aspectData.aspectTarget;
    const names = Object.getOwnPropertyNames(module.prototype);
    const isMatch = aspectData.match ? pm(aspectData.match) : () => true;

    // 存到 set 里用来做循环
    this.aspectModuleSet.add(module);

    /**
     * 拦截器流程
     * 1、在每个被拦截的 class 上做拦截标记，记录哪些方法需要被拦截
     * 2、Container 保存每个 class 的方法对应的拦截器数组
     * 3、创建完实例后，在返回前执行包裹逻辑，把需要拦截的方法都执行一遍拦截（不对原型做修改）
     */

    for (const name of names) {
      if (name === 'constructor' || !isMatch(name)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(
        module.prototype,
        name
      );
      if (!descriptor || descriptor.writable === false) {
        continue;
      }

      // 把拦截器和当前容器绑定
      if (!this.aspectMappingMap.has(module)) {
        this.aspectMappingMap.set(module, new Map());
      }

      const mappingMap = this.aspectMappingMap.get(module);
      if (!mappingMap.has(name)) {
        mappingMap.set(name, []);
      }
      // 把拦截器本身加到数组中
      const methodAspectCollection = mappingMap.get(name);

      if (isAsyncFunction(descriptor.value)) {
        this.debugLogger(
          `aspect [#${module.name}:${name}], isAsync=true, aspect class=[${aspectIns.constructor.name}]`
        );

        const fn = (ins, originMethod) => {
          return async (...args) => {
            let error, result;
            const newProceed = (...args) => {
              return originMethod.apply(ins, args);
            };
            const joinPoint = {
              methodName: name,
              target: ins,
              args: args,
              proceed: newProceed,
            };
            try {
              await aspectIns.before?.(joinPoint);
              if (aspectIns.around) {
                result = await aspectIns.around(joinPoint);
              } else {
                result = await originMethod.apply(ins, joinPoint.args);
              }
              joinPoint.proceed = undefined;
              const resultTemp = await aspectIns.afterReturn?.(
                joinPoint,
                result
              );
              result = typeof resultTemp === 'undefined' ? result : resultTemp;
              return result;
            } catch (err) {
              joinPoint.proceed = undefined;
              error = err;
              if (aspectIns.afterThrow) {
                await aspectIns.afterThrow(joinPoint, error);
              } else {
                throw err;
              }
            } finally {
              await aspectIns.after?.(joinPoint, result, error);
            }
          };
        };

        methodAspectCollection.push(fn);
      } else {
        this.debugLogger(
          `aspect [#${module.name}:${name}], isAsync=false, aspect class=[${aspectIns.constructor.name}]`
        );
        const fn = (ins, originMethod) => {
          return (...args) => {
            let error, result;
            const newProceed = (...args) => {
              return originMethod.apply(ins, args);
            };
            const joinPoint = {
              methodName: name,
              target: ins,
              args: args,
              proceed: newProceed,
            };
            try {
              aspectIns.before?.(joinPoint);
              if (aspectIns.around) {
                result = aspectIns.around(joinPoint);
              } else {
                result = originMethod.apply(ins, joinPoint.args);
              }
              const resultTemp = aspectIns.afterReturn?.(joinPoint, result);
              result = typeof resultTemp === 'undefined' ? result : resultTemp;
              return result;
            } catch (err) {
              error = err;
              if (aspectIns.afterThrow) {
                aspectIns.afterThrow(joinPoint, error);
              } else {
                throw err;
              }
            } finally {
              aspectIns.after?.(joinPoint, result, error);
            }
          };
        };

        methodAspectCollection.push(fn);
      }
    }
  }
}
