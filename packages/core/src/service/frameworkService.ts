import {
  ALL,
  APPLICATION_KEY,
  CONFIG_KEY,
  FRAMEWORK_KEY,
  getProviderUUId,
  Init,
  Inject,
  listModule,
  listPreloadModule,
  LOGGER_KEY,
  MidwayFrameworkType,
  PIPELINE_IDENTIFIER,
  PLUGIN_KEY,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import {
  IMidwayContainer,
  IMidwayFramework,
  REQUEST_OBJ_CTX_KEY,
} from '../interface';
import { MidwayConfigService } from './configService';
import { MidwayLoggerService } from './loggerService';
import { BaseFramework } from '../baseFramework';
import { MidwayPipelineService } from './pipelineService';
import { MidwayDecoratorService } from './decoratorService';
import { MidwayAspectService } from './aspectService';
import { MidwayApplicationManager } from '../common/applicationManager';
import * as util from 'util';
import { MidwayCommonError } from '../error';

const debug = util.debuglog('midway:debug');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayFrameworkService {
  @Inject()
  configService: MidwayConfigService;

  @Inject()
  loggerService: MidwayLoggerService;

  @Inject()
  aspectService: MidwayAspectService;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Inject()
  applicationManager: MidwayApplicationManager;

  constructor(
    readonly applicationContext: IMidwayContainer,
    readonly globalOptions
  ) {}

  private mainFramework: IMidwayFramework<any, any, any>;

  private globalFrameworkList: Array<IMidwayFramework<any, any, any>> = [];

  @Init()
  protected async init() {
    // register base config hook
    this.decoratorService.registerPropertyHandler(
      CONFIG_KEY,
      (propertyName, meta) => {
        if (meta.identifier === ALL) {
          return this.configService.getConfiguration();
        } else {
          return this.configService.getConfiguration(
            meta.identifier ?? propertyName
          );
        }
      }
    );

    // register @Logger decorator handler
    this.decoratorService.registerPropertyHandler(
      LOGGER_KEY,
      (propertyName, meta) => {
        return this.loggerService.getLogger(meta.identifier ?? propertyName);
      }
    );

    this.decoratorService.registerPropertyHandler(
      PIPELINE_IDENTIFIER,
      (key, meta, instance) => {
        return new MidwayPipelineService(
          instance[REQUEST_OBJ_CTX_KEY]?.requestContext ??
            this.applicationContext,
          meta.valves
        );
      }
    );

    let frameworks: Array<new (...args) => any> = listModule(FRAMEWORK_KEY);
    // filter proto
    frameworks = filterProtoFramework(frameworks);

    debug(`[core]: Found Framework length = ${frameworks.length}`);

    if (frameworks.length) {
      for (const frameworkClz of frameworks) {
        const frameworkInstance = await this.applicationContext.getAsync<
          IMidwayFramework<any, any, any>
        >(frameworkClz, [this.applicationContext]);
        // if enable, just init framework
        if (frameworkInstance.isEnable()) {
          // app init
          await frameworkInstance.initialize({
            applicationContext: this.applicationContext,
            ...this.globalOptions,
          });

          debug(
            `[core]: Found Framework "${frameworkInstance.getFrameworkName()}" and initialize.`
          );
        } else {
          debug(
            `[core]: Found Framework "${frameworkInstance.getFrameworkName()}" and delay initialize.`
          );
        }
        // app init
        const definition = this.applicationContext.registry.getDefinition(
          getProviderUUId(frameworkClz)
        );
        this.applicationManager.addFramework(
          definition?.namespace ?? frameworkInstance.getFrameworkName(),
          frameworkInstance
        );
        this.globalFrameworkList.push(frameworkInstance);
      }

      // register @App decorator handler
      this.decoratorService.registerPropertyHandler(
        APPLICATION_KEY,
        (propertyName, mete) => {
          if (mete.type) {
            const framework = this.applicationManager.getApplication(mete.type);
            if (!framework) {
              throw new MidwayCommonError(`Framework ${mete.type} not Found`);
            }
            return framework;
          } else {
            return this.getMainApp();
          }
        }
      );

      this.decoratorService.registerPropertyHandler(
        PLUGIN_KEY,
        (key, target) => {
          return this.getMainApp()[key];
        }
      );

      global['MIDWAY_MAIN_FRAMEWORK'] = this.mainFramework =
        this.globalFrameworkList[0];
    }

    // init aspect module
    await this.aspectService.loadAspect();

    // some preload module init
    const modules = listPreloadModule();
    for (const module of modules) {
      // preload init context
      await this.applicationContext.getAsync(module);
    }
  }

  public getMainApp() {
    return this.mainFramework?.getApplication();
  }

  public getMainFramework() {
    return this.mainFramework;
  }

  public getFramework(namespaceOrFrameworkType: string | MidwayFrameworkType) {
    return this.applicationManager.getFramework(namespaceOrFrameworkType);
  }

  public async runFramework() {
    for (const frameworkInstance of this.globalFrameworkList) {
      // if enable, just init framework
      if (frameworkInstance.isEnable()) {
        // app init
        await frameworkInstance.run();
        debug(
          `[core]: Found Framework "${frameworkInstance.getFrameworkName()}" and run.`
        );
      }
    }
  }

  public async stopFramework() {
    await Promise.all(
      Array.from(this.globalFrameworkList).map(frameworkInstance => {
        return frameworkInstance.stop();
      })
    );
  }
}

function filterProtoFramework(frameworks) {
  const frameworkProtoArr = [];
  // 这里把继承的框架父类都找出来，然后排除掉，只取第一层
  for (const framework of frameworks) {
    let proto = Object.getPrototypeOf(framework);
    while (proto.name && proto.name !== BaseFramework.name) {
      frameworkProtoArr.push(proto);
      proto = Object.getPrototypeOf(proto);
    }
  }
  return frameworks.filter(framework => {
    return !frameworkProtoArr.includes(framework);
  });
}
