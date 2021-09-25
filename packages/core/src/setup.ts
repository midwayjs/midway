import {
  DirectoryFileDetector,
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  ILifeCycle,
  IMidwayFramework,
  MidwayFrameworkType,
  IMidwayApplication,
} from '../src';
import { join } from 'path';
import { MidwayAspectService } from './service/aspectService';
import {
  listModule,
  APPLICATION_KEY,
  CONFIGURATION_KEY,
  LOGGER_KEY,
  CONFIG_KEY,
  ALL,
  FRAMEWORK_KEY,
} from '@midwayjs/decorator';
import { MidwayLoggerService } from './service/loggerService';
import { FunctionalConfiguration } from './functional/configuration';
import defaultConfig from './config/config.default';

export async function initializeGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
) {
  const appDir = globalOptions.appDir ?? '';
  const baseDir = globalOptions.baseDir ?? '';
  // new container
  const applicationContext = new MidwayContainer();

  if (!globalOptions.preloadModules && baseDir) {
    applicationContext.setFileDetector(
      new DirectoryFileDetector({
        loadDir: baseDir,
      })
    );
  }

  // register baseDir and appDir
  applicationContext.registerObject('baseDir', baseDir);
  applicationContext.registerObject('appDir', appDir);

  // bind inner service
  applicationContext.bindClass(MidwayEnvironmentService);
  applicationContext.bindClass(MidwayInformationService);
  applicationContext.bindClass(MidwayConfigService);
  applicationContext.bindClass(MidwayAspectService);
  applicationContext.bindClass(MidwayLoggerService);

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      this.applicationContext.bindClass(preloadModule);
    }
  }

  // init default config
  const configService = await applicationContext.getAsync(MidwayConfigService);
  configService.add([
    {
      default: defaultConfig,
    },
  ]);

  // load configuration and component
  applicationContext.load(
    globalOptions.configurationModule ?? require(join(baseDir, 'configuration'))
  );

  // bind user code module
  await applicationContext.ready();

  // merge config
  await configService.load();

  // init logger
  const loggerService = await applicationContext.getAsync(MidwayLoggerService);

  // 切面支持
  const aspectService = await applicationContext.getAsync(MidwayAspectService);
  await aspectService.loadAspect();

  const frameworks = listModule(FRAMEWORK_KEY);
  const globalAppMap = new Map<MidwayFrameworkType, IMidwayApplication<any>>();

  // init framework and app
  const frameworkInstances: IMidwayFramework<any, any>[] =
    await initializeFramework(applicationContext, globalOptions, frameworks);

  for (const frameworkInstance of frameworkInstances) {
    // app init
    globalAppMap.set(
      frameworkInstance.getFrameworkType(),
      frameworkInstance.getApplication()
    );
  }

  const mainApp = frameworkInstances[0].getApplication();

  // register @App decorator handler
  applicationContext.registerDataHandler(APPLICATION_KEY, type => {
    if (type) {
      return globalAppMap.get(type);
    } else {
      return mainApp;
    }
  });

  // register base config hook
  applicationContext.registerDataHandler(CONFIG_KEY, (key: string) => {
    if (key === ALL) {
      return configService.getConfiguration();
    } else {
      return configService.getConfiguration(key);
    }
  });

  // register @Logger decorator handler
  applicationContext.registerDataHandler(LOGGER_KEY, key => {
    return loggerService.getLogger(key);
  });

  // run lifecycle
  const cycles = listModule(CONFIGURATION_KEY);

  const lifecycleInstanceList = [];
  for (const cycle of cycles) {
    if (cycle.target instanceof FunctionalConfiguration) {
      // 函数式写法
      cycle.instance = cycle.target;
    } else {
      // 普通类写法
      if (applicationContext.registry.hasDefinition(cycle.target)) {
        cycle.instance = await applicationContext.getAsync<ILifeCycle>(
          cycle.target
        );
      }
    }

    cycle.instance && lifecycleInstanceList.push(cycle);
  }

  // exec onConfigLoad()
  for (const cycle of lifecycleInstanceList) {
    if (typeof cycle.instance.onConfigLoad === 'function') {
      const configData = await cycle.instance.onConfigLoad(applicationContext);
      if (configData) {
        this.getApplicationContext().getConfigService().addObject(configData);
      }
    }
  }

  // exec onReady()
  for (const cycle of lifecycleInstanceList) {
    if (typeof cycle.instance.onReady === 'function') {
      await cycle.instance.onReady(applicationContext, this.app);
    }
  }

  // exec onServerReady()
  for (const cycle of lifecycleInstanceList) {
    if (typeof cycle.instance.onServerReady === 'function') {
      await cycle.instance.onServerReady(applicationContext, this.app);
    }
  }

  return applicationContext;
}

export async function destroyGlobalApplicationContext(
  applicationContext: IMidwayContainer
) {
  // stop lifecycle
  const cycles = listModule(CONFIGURATION_KEY);
  for (const cycle of cycles) {
    let inst;
    if (cycle.target instanceof FunctionalConfiguration) {
      // 函数式写法
      inst = cycle.target;
    } else {
      inst = await applicationContext.getAsync<ILifeCycle>(cycle.target);
    }

    if (inst.onStop && typeof inst.onStop === 'function') {
      await inst.onStop(applicationContext, this.app);
    }
  }
  // stop container
  await applicationContext.stop();
}

async function initializeFramework(
  applicationContext: IMidwayContainer,
  globalOptions: IMidwayBootstrapOptions,
  frameworks: any[]
): Promise<IMidwayFramework<any, any>[]> {
  return Promise.all(
    frameworks.map(framework => {
      return (async () => {
        const frameworkInstance = (await applicationContext.getAsync(
          framework
        )) as IMidwayFramework<any, any>;
        // app init
        await frameworkInstance.initialize(globalOptions);
        return frameworkInstance;
      })();
    })
  );
}
