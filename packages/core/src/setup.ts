import {
  DirectoryFileDetector,
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  MidwayLoggerService,
  MidwayFrameworkService,
  MidwayAspectService,
  MidwayLifeCycleService,
} from '../src';
import defaultConfig from './config/config.default';

export async function initializeGlobalApplicationContext(
  globalOptions: Omit<IMidwayBootstrapOptions, 'applicationContext'>
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
  applicationContext.bindClass(MidwayLifeCycleService);

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
  await applicationContext.getAsync(MidwayLoggerService, [applicationContext]);

  // aop support
  await applicationContext.getAsync(MidwayAspectService, [applicationContext]);

  // framework/config/plugin/logger/app decorator support
  await applicationContext.getAsync(
    MidwayFrameworkService,
    [applicationContext, globalOptions]
  );

  // lifecycle support
  await applicationContext.getAsync(MidwayLifeCycleService,[applicationContext]);

  return applicationContext;
}

export async function destroyGlobalApplicationContext(
  applicationContext: IMidwayContainer
) {
  // stop lifecycle
  const lifecycleService = await applicationContext.getAsync(MidwayLifeCycleService);
  await lifecycleService.stop();
  // stop container
  await applicationContext.stop();
}
