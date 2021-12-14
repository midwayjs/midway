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
  MidwayApplicationManager,
  MidwayI18nService,
  safeRequire,
} from './';
import defaultConfig from './config/config.default';
import { bindContainer, clearBindContainer } from '@midwayjs/decorator';
import * as util from 'util';
import { join } from 'path';
import { loggers } from '@midwayjs/logger';
const debug = util.debuglog('midway:debug');

export async function initializeGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
) {
  debug('[core]: start "initializeGlobalApplicationContext"');
  const appDir = globalOptions.appDir ?? '';
  const baseDir = globalOptions.baseDir ?? '';

  // new container
  const applicationContext =
    globalOptions.applicationContext ?? new MidwayContainer();
  // bind container to decoratorManager
  debug('[core]: delegate module map from decoratorManager');
  bindContainer(applicationContext);

  global['MIDWAY_APPLICATION_CONTEXT'] = applicationContext;

  // register baseDir and appDir
  applicationContext.registerObject('baseDir', baseDir);
  applicationContext.registerObject('appDir', appDir);

  if (globalOptions.moduleDirector !== false) {
    if (
      globalOptions.moduleDetector === undefined ||
      globalOptions.moduleDetector === 'file'
    ) {
      applicationContext.setFileDetector(
        new DirectoryFileDetector({
          loadDir: baseDir,
          ignore: globalOptions.ignore ?? [],
        })
      );
    } else if (globalOptions.moduleDetector) {
      applicationContext.setFileDetector(globalOptions.moduleDetector);
    }
  }

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
  applicationContext.bindClass(MidwayApplicationManager);
  applicationContext.bindClass(MidwayI18nService);

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
  await applicationContext.getAsync(MidwayAspectService, [applicationContext]);

  // init decorator service
  await applicationContext.getAsync(MidwayDecoratorService, [
    applicationContext,
  ]);

  if (!globalOptions.configurationModule) {
    globalOptions.configurationModule = [
      safeRequire(join(globalOptions.baseDir, 'configuration')),
    ];
  }

  for (const configurationModule of [].concat(
    globalOptions.configurationModule
  )) {
    // load configuration and component
    applicationContext.load(configurationModule);
  }

  // bind user code module
  await applicationContext.ready();

  if (globalOptions.globalConfig) {
    if (Array.isArray(globalOptions.globalConfig)) {
      configService.add(globalOptions.globalConfig);
    } else {
      configService.addObject(globalOptions.globalConfig);
    }
  }

  // merge config
  await configService.load();
  debug('[core]: Current config = %j', configService.getConfiguration());

  // init logger
  await applicationContext.getAsync(MidwayLoggerService, [applicationContext]);

  // middleware support
  await applicationContext.getAsync(MidwayMiddlewareService, [
    applicationContext,
  ]);

  // i18n support
  await applicationContext.getAsync(MidwayI18nService, [applicationContext]);

  // framework/config/plugin/logger/app decorator support
  await applicationContext.getAsync(MidwayFrameworkService, [
    applicationContext,
    globalOptions,
  ]);

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
  loggers.close();
  global['MIDWAY_APPLICATION_CONTEXT'] = undefined;
  global['MIDWAY_MAIN_FRAMEWORK'] = undefined;
}
