import {
  DirectoryFileDetector,
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  ILifeCycle,
  MidwayLoggerService,
  MidwayFrameworkService,
  getCurrentMainApp,
} from '../src';
import { MidwayAspectService } from './service/aspectService';
import { listModule, CONFIGURATION_KEY } from '@midwayjs/decorator';
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
  applicationContext.bindClass(MidwayFrameworkService);

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  // init default config
  const configService = await applicationContext.getAsync(MidwayConfigService);
  configService.add([
    {
      default: defaultConfig,
    },
  ]);

  for (const configurationModule of [].concat(
    globalOptions.configurationModule
  )) {
    // load configuration and component
    applicationContext.load(configurationModule);
  }

  // bind user code module
  await applicationContext.ready();

  // merge config
  await configService.load();

  // init logger
  const loggerService = await applicationContext.getAsync(MidwayLoggerService);

  // alias inject logger
  applicationContext.registerObject(
    'logger',
    loggerService.getLogger('appLogger')
  );

  // aop support
  await applicationContext.getAsync(MidwayAspectService, [applicationContext]);

  // framework/config/plugin/logger/app decorator support
  const frameworkService = await applicationContext.getAsync(
    MidwayFrameworkService,
    [applicationContext, globalOptions]
  );

  const mainApp = frameworkService.getMainApp();

  // run lifecycle
  const cycles = listModule(CONFIGURATION_KEY);

  const lifecycleInstanceList = [];
  for (const cycle of cycles) {
    if (cycle.target instanceof FunctionalConfiguration) {
      // 函数式写法
      cycle.instance = cycle.target;
    } else {
      // 普通类写法
      cycle.instance = await applicationContext.getAsync<ILifeCycle>(
        cycle.target
      );
    }

    cycle.instance && lifecycleInstanceList.push(cycle);
  }

  // exec onConfigLoad()
  for (const cycle of lifecycleInstanceList) {
    if (typeof cycle.instance.onConfigLoad === 'function') {
      const configData = await cycle.instance.onConfigLoad(applicationContext);
      if (configData) {
        configService.addObject(configData);
      }
    }
  }

  // exec onReady()
  for (const cycle of lifecycleInstanceList) {
    if (typeof cycle.instance.onReady === 'function') {
      await cycle.instance.onReady(applicationContext, mainApp);
    }
  }

  // exec onServerReady()
  for (const cycle of lifecycleInstanceList) {
    if (typeof cycle.instance.onServerReady === 'function') {
      await cycle.instance.onServerReady(applicationContext, mainApp);
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

    if (inst?.onStop && typeof inst.onStop === 'function') {
      await inst.onStop(applicationContext, getCurrentMainApp());
    }
  }
  // stop container
  await applicationContext.stop();
}
