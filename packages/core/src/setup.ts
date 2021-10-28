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
  MidwayMiddlewareService,
  MidwayDecoratorService,
} from './';
import defaultConfig from './config/config.default';
import { bindContainer, clearBindContainer } from '@midwayjs/decorator';

export async function initializeGlobalApplicationContext(
  globalOptions: Omit<IMidwayBootstrapOptions, 'applicationContext'>
) {
  const appDir = globalOptions.appDir ?? '';
  const baseDir = globalOptions.baseDir ?? '';
  // new container
  const applicationContext = new MidwayContainer();
  // bind container to decoratorManager
  bindContainer(applicationContext);

  if (!globalOptions.preloadModules && baseDir) {
    applicationContext.setFileDetector(
      new DirectoryFileDetector({
        loadDir: baseDir,
        ignore: globalOptions.ignore ?? [],
      })
    );
  }

  // register baseDir and appDir
  applicationContext.registerObject('baseDir', baseDir);
  applicationContext.registerObject('appDir', appDir);

  // bind inner service
  applicationContext.bindClass(MidwayEnvironmentService);
  applicationContext.bindClass(MidwayInformationService);
  applicationContext.bindClass(MidwayDecoratorService);
  applicationContext.bindClass(MidwayConfigService);
  applicationContext.bindClass(MidwayAspectService);
  applicationContext.bindClass(MidwayLoggerService);
  applicationContext.bindClass(MidwayFrameworkService);
  applicationContext.bindClass(MidwayMiddlewareService);
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

  // init aop support
  const aspectService = await applicationContext.getAsync(MidwayAspectService, [
    applicationContext,
  ]);

  // init decorator service
  await applicationContext.getAsync(MidwayDecoratorService, [
    applicationContext,
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

  // middleware support
  await applicationContext.getAsync(MidwayMiddlewareService, [
    applicationContext,
  ]);

  // framework/config/plugin/logger/app decorator support
  await applicationContext.getAsync(MidwayFrameworkService, [
    applicationContext,
    globalOptions,
  ]);

  // TODO 移动到 framework load aspect
  await aspectService.loadAspect();

  // lifecycle support
  await applicationContext.getAsync(MidwayLifeCycleService, [
    applicationContext,
  ]);

  return applicationContext;
}

export async function destroyGlobalApplicationContext(
  applicationContext: IMidwayContainer
) {
  // stop lifecycle
  const lifecycleService = await applicationContext.getAsync(
    MidwayLifeCycleService
  );
  await lifecycleService.stop();
  // stop container
  await applicationContext.stop();
  clearBindContainer();
}
