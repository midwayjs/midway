import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Inject,
  MidwayFrameworkType,
  listModule,
  listPreloadModule,
  ALL,
  LOGGER_KEY,
  CONFIG_KEY,
  FRAMEWORK_KEY,
  APPLICATION_KEY,
  PLUGIN_KEY,
  PIPELINE_IDENTIFIER,
} from '@midwayjs/decorator';
import {
  IMidwayApplication,
  IMidwayBootstrapOptions,
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

  constructor(
    readonly applicationContext: IMidwayContainer,
    readonly globalOptions
  ) {}

  private mainFramework: IMidwayFramework<any, any>;
  private mainApp: IMidwayApplication;

  private globalAppMap = new Map<
    MidwayFrameworkType,
    IMidwayApplication<any>
  >();

  private globalFrameworkMap = new Map<
    MidwayFrameworkType,
    IMidwayFramework<any, any>
  >();

  @Init()
  async init() {
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

    let frameworks = listModule(FRAMEWORK_KEY);
    // filter proto
    frameworks = filterProtoFramework(frameworks);

    if (frameworks.length) {
      // init framework and app
      const frameworkInstances: IMidwayFramework<any, any>[] =
        await initializeFramework(
          this.applicationContext,
          this.globalOptions,
          frameworks
        );

      for (const frameworkInstance of frameworkInstances) {
        // app init
        this.globalAppMap.set(
          frameworkInstance.getFrameworkType(),
          frameworkInstance.getApplication()
        );
        this.globalFrameworkMap.set(
          frameworkInstance.getFrameworkType(),
          frameworkInstance
        );
      }

      global['MIDWAY_MAIN_FRAMEWORK'] = this.mainFramework =
        frameworkInstances[0];
      this.mainApp = this.mainFramework.getApplication();

      // register @App decorator handler
      this.decoratorService.registerPropertyHandler(
        APPLICATION_KEY,
        (propertyName, mete) => {
          if (mete.type) {
            return this.globalAppMap.get(mete.type as any);
          } else {
            return this.mainApp;
          }
        }
      );

      this.decoratorService.registerPropertyHandler(
        PLUGIN_KEY,
        (key, target) => {
          return this.mainApp[key];
        }
      );
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
    return this.mainApp;
  }

  public getMainFramework() {
    return this.mainFramework;
  }

  public getFramework(type: MidwayFrameworkType) {
    return this.globalFrameworkMap.get(type);
  }

  public async stopFramework() {
    await Promise.all(
      Array.from(this.globalFrameworkMap.values()).map(frameworkInstance => {
        return frameworkInstance.stop();
      })
    );
  }
}

async function initializeFramework(
  applicationContext: IMidwayContainer,
  globalOptions: IMidwayBootstrapOptions,
  frameworks: any[]
): Promise<IMidwayFramework<any, any>[]> {
  return Promise.all(
    frameworks.map(framework => {
      // bind first
      applicationContext.bindClass(framework);
      return (async () => {
        const frameworkInstance = (await applicationContext.getAsync(
          framework,
          [applicationContext]
        )) as IMidwayFramework<any, any>;
        // if enable, just init framework
        if (frameworkInstance.isEnable()) {
          // app init
          await frameworkInstance.initialize({
            applicationContext,
            ...globalOptions,
          });
        }
        return frameworkInstance;
      })();
    })
  );
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
