import {
  ALL,
  classNamed,
  CONFIG_KEY,
  CONFIGURATION_KEY,
  DecoratorManager,
  generateProvideId,
  getClassMetadata,
  getConstructorInject,
  getObjectDefProps,
  getProviderId,
  IComponentInfo,
  INJECT_CLASS_KEY_PREFIX,
  InjectionConfigurationOptions,
  isAsyncFunction,
  isClass,
  isFunction,
  isProvide,
  LIFECYCLE_IDENTIFIER_PREFIX,
  listModule,
  MAIN_MODULE_KEY,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  PRIVATE_META_DATA_KEY,
  saveClassMetadata,
  saveModule,
  saveProviderId,
  ScopeEnum,
  TAGGED_PROP,
  saveIdentifierMapping,
  hasIdentifierMapping,
  getIdentifierMapping,
  getProviderUUId,
} from '@midwayjs/decorator';
import { FunctionalConfiguration } from '../functional/configuration';
import * as util from 'util';
import { BaseApplicationContext } from './applicationContext';
import {
  IApplicationContext,
  IConfigService,
  IEnvironmentService,
  IFileDetector,
  IInformationService,
  IMidwayContainer,
  IObjectDefinitionMetadata,
  REQUEST_CTX_KEY,
} from '../interface';
import { getOwnMetadata, recursiveGetPrototypeOf } from '../common/reflectTool';
import { FUNCTION_INJECT_KEY } from '../common/constants';
import { ObjectDefinition } from '../definitions/objectDefinition';
import { FunctionDefinition } from '../definitions/functionDefinition';
import { ManagedReference, ManagedValue } from './managed';
import { ResolverHandler } from './resolverHandler';
import { MidwayEnvironmentService } from '../service/environmentService';
import { MidwayConfigService } from '../service/configService';
import { MidwayAspectService } from '../service/aspectService';

const debug = util.debuglog('midway:container:configuration');
const globalDebugLogger = util.debuglog('midway:container');

class ContainerConfiguration {
  private namespace;

  constructor(readonly container) {}

  load(module) {
    // 可能导出多个
    const configurationExports = this.getConfigurationExport(module);
    if (!configurationExports.length) return;
    // 多个的情况，数据交给第一个保存
    for (let i = 0; i < configurationExports.length; i++) {
      const configurationExport = configurationExports[i];
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

      debug('   configuration export %j.', configurationOptions);
      if (configurationOptions) {
        if (
          this.namespace !== MAIN_MODULE_KEY &&
          configurationOptions.namespace !== undefined
        ) {
          this.namespace = configurationOptions.namespace;
        }

        // if (i === 0 && this.namespace === MAIN_MODULE_KEY) {
        //   // set conflictCheck
        //   if (configurationOptions.conflictCheck === undefined) {
        //     configurationOptions.conflictCheck = false;
        //   }
        //   this.container.disableConflictCheck =
        //     !configurationOptions.conflictCheck;
        // }

        this.addImports(configurationOptions.imports);
        this.addImportConfigs(configurationOptions.importConfigs);
        this.bindConfigurationClass(configurationExport);
      }
    }
  }

  addImportConfigs(importConfigs: string[]) {
    if (importConfigs && importConfigs.length) {
      debug('   import configs %j".', importConfigs);
      this.container.getConfigService().add(importConfigs);
    }
  }

  addImports(imports: any[] = []) {
    // 处理 imports
    for (let importPackage of imports) {
      if (!importPackage) continue;
      if (typeof importPackage === 'string') {
        importPackage = require(importPackage);
      }
      // for package
      const subContainerConfiguration = this.container.createConfiguration();
      if ('Configuration' in importPackage) {
        // component is object
        debug(
          '\n---------- start load configuration from submodule" ----------'
        );
        subContainerConfiguration.load(importPackage);
        debug(
          `---------- end load configuration from sub package "${importPackage}" ----------`
        );
      } else if ('component' in importPackage) {
        if (
          (importPackage as IComponentInfo)?.enabledEnvironment?.includes(
            this.container.getCurrentEnv()
          )
        ) {
          subContainerConfiguration.load(
            (importPackage as IComponentInfo).component
          );
        }
      } else {
        subContainerConfiguration.load(importPackage);
      }
    }
  }

  bindConfigurationClass(clzz, filePath?: string) {
    if (clzz instanceof FunctionalConfiguration) {
      // 函数式写法不需要绑定到容器
    } else {
      // 普通类写法
      const clzzName = `${LIFECYCLE_IDENTIFIER_PREFIX}${classNamed(clzz.name)}`;
      const id = generateProvideId(clzzName, this.namespace);
      saveProviderId(id, clzz, true);
      this.container.bind(id, clzz, {
        namespace: this.namespace,
        srcPath: filePath,
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
        namespace: this.namespace,
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

export class MidwayContainer
  extends BaseApplicationContext
  implements IMidwayContainer
{
  private debugLogger = globalDebugLogger;
  private definitionMetadataList = [];
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

  load(module?) {
    this.isLoad = true;
    if (module) {
      // load configuration
      const configuration = this.createConfiguration();
      configuration.load(module);
    }

    // register base config hook
    if (!this.resolverHandler.hasHandler(CONFIG_KEY)) {
      this.registerDataHandler(CONFIG_KEY, (key: string) => {
        if (key === ALL) {
          return this.getConfigService().getConfiguration();
        } else {
          return this.getConfigService().getConfiguration(key);
        }
      });
    }
  }

  loadDefinitions() {
    if (!this.isLoad) {
      this.load();
    }
    // load project file
    this.fileDetector?.run(this);
    // init config service
    this.configService.load();
  }

  createConfiguration() {
    return new ContainerConfiguration(this);
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

    // @async, @init, @destroy @scope
    const objDefOptions: ObjectDefinitionOptions =
      getObjectDefProps(target) ?? {};
    if (objDefOptions.initMethod) {
      this.debugLogger(`  register initMethod = ${objDefOptions.initMethod}`);
      definitionMeta.initMethod = objDefOptions.initMethod;
    }

    if (objDefOptions.destroyMethod) {
      this.debugLogger(
        `  register destroyMethod = ${objDefOptions.destroyMethod}`
      );
      definitionMeta.destroyMethod = objDefOptions.destroyMethod;
    }

    if (objDefOptions.scope) {
      this.debugLogger(`  register scope = ${objDefOptions.scope}`);
      definitionMeta.scope = objDefOptions.scope;
    }

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

  getDebugLogger() {
    return this.debugLogger;
  }

  setFileDetector(fileDetector: IFileDetector) {
    this.fileDetector = fileDetector;
  }

  createChild(): IMidwayContainer {
    return new MidwayContainer('', this);
  }

  registerDataHandler(handlerType: string, handler: (...args) => any) {
    this.resolverHandler.registerHandler(handlerType, handler);
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
}
