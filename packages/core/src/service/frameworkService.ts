import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  CONFIG_KEY,
  ALL,
  LOGGER_KEY,
  Inject,
  listModule,
  FRAMEWORK_KEY,
  MidwayFrameworkType,
  APPLICATION_KEY,
  listPreloadModule,
} from '@midwayjs/decorator';
import {
  FrameworkDecoratorMetadata,
  HandlerFunction,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
} from '../interface';
import { MidwayConfigService } from './configService';
import { MidwayLoggerService } from './loggerService';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayFrameworkService {
  @Inject()
  configService: MidwayConfigService;

  @Inject()
  loggerService: MidwayLoggerService;

  handlerMap = new Map<string, HandlerFunction>();

  constructor(
    readonly applicationContext: IMidwayContainer,
    readonly globalOptions
  ) {}

  private mainApp: IMidwayApplication;

  @Init()
  async init() {
    const frameworks = listModule(FRAMEWORK_KEY);
    const globalAppMap = new Map<
      MidwayFrameworkType,
      IMidwayApplication<any>
    >();

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
        globalAppMap.set(
          frameworkInstance.getFrameworkType(),
          frameworkInstance.getApplication()
        );
      }

      global['MIDWAY_MAIN_FRAMEWORK'] = frameworkInstances[0];
      this.mainApp = frameworkInstances[0].getApplication();

      // register @App decorator handler
      this.registerHandler(APPLICATION_KEY, type => {
        if (type) {
          return globalAppMap.get(type as any);
        } else {
          return this.mainApp;
        }
      });
    }

    // register base config hook
    this.registerHandler(CONFIG_KEY, (key: string) => {
      if (key === ALL) {
        return this.configService.getConfiguration();
      } else {
        return this.configService.getConfiguration(key);
      }
    });

    // register @Logger decorator handler
    this.registerHandler(LOGGER_KEY, key => {
      return this.loggerService.getLogger(key);
    });

    this.applicationContext.onObjectCreated((instance, options) => {
      if (this.handlerMap.size > 0 && Array.isArray(options.definition.handlerProps)) {
        // 已经预先在 bind 时处理
        for (const item of options.definition.handlerProps) {
          this.defineGetterPropertyValue(
            item.prop,
            instance,
            this.getHandler(item.handlerKey)
          );
        }
      }
    });

    // some preload module init
    const modules = listPreloadModule();
    for (const module of modules) {
      // preload init context
      await this.applicationContext.getAsync(module);
    }
  }

  getMainApp() {
    return this.mainApp;
  }

  /**
   * binding getter method for decorator
   *
   * @param setterProps
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(
    prop: FrameworkDecoratorMetadata,
    instance,
    getterHandler
  ) {
    if (prop && getterHandler) {
      if (prop.propertyName) {
        Object.defineProperty(instance, prop.propertyName, {
          get: () => getterHandler(prop.targetKey, prop, instance),
          configurable: true, // 继承对象有可能会有相同属性，这里需要配置成 true
          enumerable: true,
        });
      }
    }
  }

  private getHandler(key: string) {
    if (this.handlerMap.has(key)) {
      return this.handlerMap.get(key);
    }
  }

  public registerHandler(key: string, fn: HandlerFunction) {
    this.handlerMap.set(key, fn);
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
          framework
        )) as IMidwayFramework<any, any>;
        // app init
        await frameworkInstance.initialize({
          applicationContext,
          ...globalOptions,
        });
        return frameworkInstance;
      })();
    })
  );
}
