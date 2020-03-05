import * as globby from 'globby';
import {
  CLASS_KEY_CONSTRUCTOR,
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
  getClassMetadata,
  getObjectDefinition,
  getProviderId,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  ScopeEnum,
  PIPELINE_IDENTIFIER,
  listModule,
  LIFECYCLE_KEY
} from '@midwayjs/decorator';
import * as is from 'is-type-of';
import { join } from 'path';
import { ContainerConfiguration } from './configuration';
import { FUNCTION_INJECT_KEY, MidwayHandlerKey } from '../common/constants';
import { IConfigService, IEnvironmentService, IMidwayContainer, IApplicationContext, MAIN_MODULE_KEY, IContainerConfiguration, ILifeCycle } from '../interface';
import { MidwayConfigService } from '../service/configService';
import { MidwayEnvironmentService } from '../service/environmentService';
import { Container } from './container';
import { generateProvideId } from '../common/util';
import { pipelineFactory } from '../features/pipeline';

const DEFAULT_PATTERN = ['**/**.ts', '**/**.tsx', '**/**.js', '!**/**.d.ts'];
const DEFAULT_IGNORE_PATTERN = [
  '**/node_modules/**',
  '**/logs/**',
  '**/run/**',
  '**/public/**',
  '**/view/**',
  '**/views/**',
];

const graphviz = require('graphviz');
const debug = require('debug')('midway:container');

interface FrameworkDecoratorMetadata {
  key: string;
  propertyName: string;
}

export class MidwayContainer extends Container implements IMidwayContainer {
  handlerMap: Map<string, (handlerKey: string, instance?: any) => any>;
  // 仅仅用于兼容requestContainer的ctx
  ctx = {};
  readyBindModules: Map<string, Set<any>> = new Map();
  configurationMap: Map<string, IContainerConfiguration> = new Map();
  configService: IConfigService;
  environmentService: IEnvironmentService;

  constructor(
    baseDir: string = process.cwd(),
    parent: IApplicationContext = undefined,
  ) {
    super(baseDir, parent);
  }

  init(): void {
    this.handlerMap = new Map();
    this.initService();

    this.registerEachCreatedHook();
    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject('ctx', this.ctx);
  }

  initService() {
    this.environmentService = new MidwayEnvironmentService();
    this.configService = new MidwayConfigService(this);
  }

  /**
   * load directory and traverse file to find bind class
   * @param opts
   */
  load(opts: {
    loadDir: string | string[];
    pattern?: string | string[];
    ignore?: string | string[];
  }) {
    // create main module configuration
    const configuration = this.createConfiguration();
    configuration.namespace = MAIN_MODULE_KEY;
    configuration.load(this.baseDir);
    // loadDir
    this.loadDirectory(opts);

    this.registerImportObjects(configuration.getImportObjects());

    // load configuration
    for (const [namespace, containerConfiguration] of this.configurationMap) {
      // main 的需要 skip 掉
      if (namespace === MAIN_MODULE_KEY) {
        continue;
      }

      const subDirs = containerConfiguration.getImportDirectory();
      if (subDirs && subDirs.length > 0) {
        debug('load configuration dir => %j, namespace => %s.',
          subDirs, namespace);
        this.loadDirectory({
          ...opts,
          loadDir: subDirs,
          namespace
        });
      }

      this.registerImportObjects(containerConfiguration.getImportObjects(),
        containerConfiguration.namespace);
    }
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
      const fileResults = globby.sync(
        DEFAULT_PATTERN.concat(opts.pattern || []),
        {
          followSymbolicLinks: false,
          cwd: dir,
          followSymbolicLinks: false,
          ignore: DEFAULT_IGNORE_PATTERN.concat(opts.ignore || []),
          suppressErrors: true
        }
      );

      for (const name of fileResults) {
        const file = join(dir, name);
        debug(`binding file => ${file}, namespace => ${opts.namespace}`);
        const exports = require(file);
        // add module to set
        this.bindClass(exports, opts.namespace);
      }
    }
  }

  bindClass(exports, namespace = '') {
    if (is.class(exports) || is.function(exports)) {
      this.bindModule(exports, namespace);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (is.class(module) || is.function(module)) {
          this.bindModule(module, namespace);
        }
      }
    }
  }

  protected bindModule(module, namespace = '') {
    if (is.class(module)) {
      const providerId = getProviderId(module);
      if (providerId) {
        this.bind(
          generateProvideId(providerId, namespace),
          module,
          { namespace }
        );
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
        this.bind(
          generateProvideId(info.id, namespace),
          module,
          {
            scope: info.scope,
            isAutowire: info.isAutowire,
            namespace
          }
        );
      }
    }
  }

  createChild() {
    const child = new MidwayContainer(this.baseDir, this);
    return child;
  }

  protected registerEachCreatedHook() {
    // register constructor inject
    this.beforeEachCreated((target, constructorArgs, context) => {
      let constructorMetaData;
      try {
        constructorMetaData = getClassMetadata(CLASS_KEY_CONSTRUCTOR, target);
      } catch (e) {
        debug(`beforeEachCreated error ${e.stack}`);
      }
      // lack of field
      if (constructorMetaData && constructorArgs) {
        for (const idx in constructorMetaData) {
          const index = parseInt(idx, 10);
          const propertyMeta = constructorMetaData[index];
          let result;

          switch (propertyMeta.type) {
            case 'config':
              result = this.findHandlerHook(MidwayHandlerKey.CONFIG)(
                propertyMeta.key
              );
              break;
            case 'logger':
              result = this.findHandlerHook(MidwayHandlerKey.LOGGER)(
                propertyMeta.key
              );
              break;
            case 'plugin':
              result = this.findHandlerHook(MidwayHandlerKey.PLUGIN)(
                propertyMeta.key
              );
              break;
          }
          constructorArgs[index] = result;
        }
      }
    });

    // register property inject
    this.afterEachCreated((instance, context, definition) => {
      // 处理配置装饰器
      const configSetterProps: FrameworkDecoratorMetadata[] = getClassMetadata(
        CONFIG_KEY,
        instance
      );
      this.defineGetterPropertyValue(
        configSetterProps,
        instance,
        this.findHandlerHook(MidwayHandlerKey.CONFIG)
      );
      // 处理插件装饰器
      const pluginSetterProps: FrameworkDecoratorMetadata[] = getClassMetadata(
        PLUGIN_KEY,
        instance
      );
      this.defineGetterPropertyValue(
        pluginSetterProps,
        instance,
        this.findHandlerHook(MidwayHandlerKey.PLUGIN)
      );
      // 处理日志装饰器
      const loggerSetterProps: FrameworkDecoratorMetadata[] = getClassMetadata(
        LOGGER_KEY,
        instance
      );
      this.defineGetterPropertyValue(
        loggerSetterProps,
        instance,
        this.findHandlerHook(MidwayHandlerKey.LOGGER)
      );
    });
  }

  /**
   * binding getter method for decorator
   *
   * @param setterProps
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(
    setterProps: FrameworkDecoratorMetadata[],
    instance,
    getterHandler
  ) {
    if (setterProps && getterHandler) {
      for (const prop of setterProps) {
        if (prop.propertyName) {
          Object.defineProperty(instance, prop.propertyName, {
            get: () => getterHandler(prop.key, instance),
            configurable: false,
            enumerable: true,
          });
        }
      }
    }
  }

  registerDataHandler(handlerType: string, handler: (handlerKey) => any) {
    this.handlerMap.set(handlerType, handler);
  }

  registerCustomBinding(objectDefinition, target) {
    super.registerCustomBinding(objectDefinition, target);

    // Override the default scope to request
    const objDefOptions: ObjectDefinitionOptions = getObjectDefinition(target);
    if (objDefOptions && !objDefOptions.scope) {
      debug(
        `register @scope to default value(request), id=${objectDefinition.id}`
      );
      objectDefinition.scope = ScopeEnum.Request;
    }
  }

  dumpDependency() {
    const g = graphviz.digraph('G');

    for (const [id, module] of this.dependencyMap.entries()) {
      g.addNode(id, {
        label: `${id}(${module.name})\nscope:${module.scope}`,
        fontsize: '10',
      });
      module.properties.forEach(depId => {
        g.addEdge(id, depId, { label: `properties`, fontsize: '8' });
      });
      module.constructorArgs.forEach(depId => {
        g.addEdge(id, depId, { label: 'constructor', fontsize: '8' });
      });
    }

    try {
      return g.to_dot();
    } catch (err) {
      console.error(
        'generate injection dependency tree fail, err = ',
        err.message
      );
    }
  }

  /**
   * get hook from current map or parent map
   * @param hookKey
   */
  findHandlerHook(hookKey: string) {
    if (this.handlerMap.has(hookKey)) {
      return this.handlerMap.get(hookKey);
    }

    if (this.parent) {
      return (this.parent as MidwayContainer).findHandlerHook(hookKey);
    }
  }

  createConfiguration(): IContainerConfiguration {
    const containerConfiguration = new ContainerConfiguration(this);
    return containerConfiguration;
  }

  addConfiguration(configuration: IContainerConfiguration) {
    this.configurationMap.set(configuration.namespace, configuration);
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

  async ready() {
    super.ready();
    if (this.configService) {
      // register handler for container
      this.registerDataHandler(MidwayHandlerKey.CONFIG, (key: string) => {
        const val = this.configService.getConfiguration(key);
        debug('@config key => %s value => %j.', key, val);
        return val;
      });
      // 加载配置
      await this.configService.load();
    }

    // 增加 lifecycle 支持
    await this.loadAndReadyLifeCycles();
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
    this.midwayIdentifiers.push(PIPELINE_IDENTIFIER);
  }

  private async loadAndReadyLifeCycles() {
    const cycles = listModule(LIFECYCLE_KEY);
    debug('load lifecycle length => %s.', cycles && cycles.length);
    for (const cycle of cycles) {
      const providerId = getProviderId(cycle);
      debug('ready lifecycle id => %s.', providerId);
      const inst = await this.getAsync<ILifeCycle>(providerId);
      await inst.onReady();
    }
  }
}
