import {
  AspectMetadata,
  CONFIGURATION_KEY,
  getObjectDefinition,
  getProviderId,
  IMethodAspect,
  isProvide,
  listModule,
  ObjectDefinitionOptions,
  ObjectIdentifier,
  PIPELINE_IDENTIFIER,
  saveClassMetadata,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as is from 'is-type-of';
import { ContainerConfiguration } from './configuration';
import { FUNCTION_INJECT_KEY, generateProvideId, PRIVATE_META_DATA_KEY } from '..';
import {
  IApplicationContext,
  IConfigService,
  IContainerConfiguration,
  IEnvironmentService,
  ILifeCycle,
  IMidwayContainer,
  MAIN_MODULE_KEY,
  REQUEST_CTX_KEY,
} from '../interface';
import { MidwayConfigService } from '../service/configService';
import { MidwayEnvironmentService } from '../service/environmentService';
import { Container } from './container';
import { pipelineFactory } from '../features/pipeline';
import { ResolverHandler } from './resolverHandler';
import { run } from '@midwayjs/glob';
import { isAsyncFunction } from '../util';
import * as pm from 'picomatch';

const DEFAULT_PATTERN = ['**/**.ts', '**/**.tsx', '**/**.js'];
const DEFAULT_IGNORE_PATTERN = [
  '**/**.d.ts',
  '**/logs/**',
  '**/run/**',
  '**/public/**',
  '**/view/**',
  '**/views/**',
];

export class MidwayContainer extends Container implements IMidwayContainer {
  resolverHandler: ResolverHandler;
  // 仅仅用于兼容requestContainer的ctx
  ctx = {};
  readyBindModules: Map<string, Set<any>> = new Map();
  configurationMap: Map<string, IContainerConfiguration> = new Map();
  // 特殊处理，按照 main 加载
  likeMainConfiguration: IContainerConfiguration[] = [];
  configService: IConfigService;
  environmentService: IEnvironmentService;

  constructor(
    baseDir: string = process.cwd(),
    parent: IApplicationContext = undefined
  ) {
    super(baseDir, parent);
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
    // 添加全局白名单
    this.midwayIdentifiers.push(PIPELINE_IDENTIFIER);
    this.midwayIdentifiers.push(REQUEST_CTX_KEY);

    this.debugLogger('main:create "Main Module" and "Main Configuration"');
    // create main module configuration
    const configuration = this.createConfiguration();
    configuration.namespace = MAIN_MODULE_KEY;
    this.debugLogger(`main:"Main Configuration" load from "${this.baseDir}"`);
    configuration.load(this.baseDir);
    // loadDir
    this.debugLogger('main:load directory');
    this.loadDirectory(opts);

    this.debugLogger('main:main configuration register import objects');
    this.registerImportObjects(configuration.getImportObjects());

    // load configuration
    for (const [packageName, containerConfiguration] of this.configurationMap) {
      // main 的需要 skip 掉
      if (containerConfiguration.namespace === MAIN_MODULE_KEY) {
        continue;
      }
      this.debugLogger(`main:load configuration from ${packageName}`);
      this.loadConfiguration(opts, containerConfiguration);
    }
    for (const containerConfiguration of this.likeMainConfiguration) {
      this.loadConfiguration(opts, containerConfiguration);
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
    if (is.class(exports) || is.function(exports)) {
      this.bindModule(exports, namespace, filePath);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (is.class(module) || is.function(module)) {
          this.bindModule(module, namespace, filePath);
        }
      }
    }
  }

  protected bindModule(module, namespace = '', filePath?: string) {
    if (is.class(module)) {
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

  createChild() {
    return new MidwayContainer(this.baseDir, this);
  }

  registerDataHandler(handlerType: string, handler: (handlerKey) => any) {
    this.resolverHandler.registerHandler(handlerType, handler);
  }

  registerCustomBinding(objectDefinition, target) {
    super.registerCustomBinding(objectDefinition, target);

    // Override the default scope to request
    const objDefOptions: ObjectDefinitionOptions = getObjectDefinition(target);
    if (objDefOptions && !objDefOptions.scope) {
      this.debugLogger('  @scope => request');
      objectDefinition.scope = ScopeEnum.Request;
    }
  }

  createConfiguration(): IContainerConfiguration {
    const containerConfiguration = new ContainerConfiguration(this);
    return containerConfiguration;
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

  public async addAspect(
    aspectIns: IMethodAspect,
    aspectData: AspectMetadata
  ) {
    const module = aspectData.aspectTarget;
    const names = Object.getOwnPropertyNames(module.prototype);
    const isMatch = aspectData.match ? pm(aspectData.match) : () => true;

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
      const originMethod = descriptor.value;
      if (isAsyncFunction(originMethod)) {
        this.debugLogger(`aspect [#${module.name}:${name}], isAsync=true, aspect class=[${aspectIns.constructor.name}]`);
        descriptor.value = async function (...args) {
          let error, result;
          const joinPoint = {
            methodName: name,
            target: this,
            args: args,
            proceed: originMethod,
          };
          try {
            await aspectIns.before?.(joinPoint);
            if (aspectIns.around) {
              result = await aspectIns.around(joinPoint);
            } else {
              result = await originMethod.apply(this, joinPoint.args);
            }
            const resultTemp = await aspectIns.afterReturn?.(
              joinPoint,
              result
            );
            result = typeof resultTemp === 'undefined' ? result : resultTemp;
            return result;
          } catch (err) {
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
      } else {
        this.debugLogger(`aspect [#${module.name}:${name}], isAsync=false, aspect class=[${aspectIns.constructor.name}]`);
        descriptor.value = function (...args) {
          let error, result;
          const joinPoint = {
            methodName: name,
            target: this,
            args: args,
            proceed: originMethod,
          };
          try {
            aspectIns.before?.(joinPoint);
            if (aspectIns.around) {
              result = aspectIns.around(joinPoint);
            } else {
              result = originMethod.apply(this, joinPoint.args);
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
      }

      Object.defineProperty(module.prototype, name, descriptor);
    }
  }

  async ready() {
    super.ready();
    if (this.configService) {
      // 加载配置
      await this.configService.load();
    }

    // 增加 lifecycle 支持
    await this.loadAndReadyLifeCycles();
  }

  async stop(): Promise<void> {
    const cycles = listModule(CONFIGURATION_KEY);
    this.debugLogger(
      'load lifecycle length => %s when stop.',
      cycles && cycles.length
    );
    for (const cycle of cycles) {
      const providerId = getProviderId(cycle);
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

  private async loadAndReadyLifeCycles() {
    const cycles = listModule(CONFIGURATION_KEY);
    this.debugLogger('load lifecycle length => %s.', cycles && cycles.length);
    for (const cycle of cycles) {
      const providerId = getProviderId(cycle);
      this.debugLogger('ready lifecycle id => %s.', providerId);
      const inst = await this.getAsync<ILifeCycle>(providerId);
      if (typeof inst.onReady === 'function') {
        await inst.onReady(this);
      }
    }
  }
}
