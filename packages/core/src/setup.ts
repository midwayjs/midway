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
  MidwayMockService,
  MidwayWebRouterService,
  safeRequire,
} from './';
import defaultConfig from './config/config.default';
import {
  bindContainer,
  clearBindContainer,
  listPreloadModule,
} from './decorator';
import * as util from 'util';
import { join } from 'path';
import { MidwayServerlessFunctionService } from './service/slsFunctionService';
const debug = util.debuglog('midway:debug');

/**
 * midway framework main entry, this method bootstrap all service and framework.
 * @param globalOptions
 */
export async function initializeGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
): Promise<IMidwayContainer> {
  const applicationContext = prepareGlobalApplicationContext(globalOptions);

  // init logger
  const loggerService = await applicationContext.getAsync(MidwayLoggerService, [
    applicationContext,
    globalOptions,
  ]);

  if (loggerService.getLogger('appLogger')) {
    // register global logger
    applicationContext.registerObject(
      'logger',
      loggerService.getLogger('appLogger')
    );
  }

  // framework/config/plugin/logger/app decorator support
  await applicationContext.getAsync(MidwayFrameworkService, [
    applicationContext,
    globalOptions,
  ]);

  // lifecycle support
  await applicationContext.getAsync(MidwayLifeCycleService, [
    applicationContext,
  ]);

  // some preload module init
  const modules = listPreloadModule();
  for (const module of modules) {
    // preload init context
    await applicationContext.getAsync(module);
  }

  return applicationContext;
}

export async function destroyGlobalApplicationContext(
  applicationContext: IMidwayContainer
) {
  const loggerService = await applicationContext.getAsync(MidwayLoggerService);
  const loggerFactory = loggerService.getCurrentLoggerFactory();

  // stop lifecycle
  const lifecycleService = await applicationContext.getAsync(
    MidwayLifeCycleService
  );
  await lifecycleService.stop();
  // stop container
  await applicationContext.stop();
  clearBindContainer();
  loggerFactory.close();
  global['MIDWAY_APPLICATION_CONTEXT'] = undefined;
  global['MIDWAY_MAIN_FRAMEWORK'] = undefined;
}

/**
 * prepare applicationContext, it use in egg framework.
 * @param globalOptions
 */
export function prepareGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
) {
  debug('[core]: start "initializeGlobalApplicationContext"');
  debug(`[core]: bootstrap options = ${util.inspect(globalOptions)}`);
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

  if (globalOptions.moduleDetector !== false) {
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
  applicationContext.bindClass(MidwayAspectService);
  applicationContext.bindClass(MidwayDecoratorService);
  applicationContext.bindClass(MidwayConfigService);
  applicationContext.bindClass(MidwayLoggerService);
  applicationContext.bindClass(MidwayApplicationManager);
  applicationContext.bindClass(MidwayFrameworkService);
  applicationContext.bindClass(MidwayMiddlewareService);
  applicationContext.bindClass(MidwayLifeCycleService);
  applicationContext.bindClass(MidwayMockService);
  applicationContext.bindClass(MidwayWebRouterService);
  applicationContext.bindClass(MidwayServerlessFunctionService);

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  // init default config
  const configService = applicationContext.get(MidwayConfigService);
  configService.add([
    {
      default: defaultConfig,
    },
  ]);

  // init aop support
  applicationContext.get(MidwayAspectService, [applicationContext]);

  // init decorator service
  applicationContext.get(MidwayDecoratorService, [applicationContext]);

  if (!globalOptions.imports) {
    globalOptions.imports = [
      safeRequire(join(globalOptions.baseDir, 'configuration')),
    ];
  }

  for (const configurationModule of []
    .concat(globalOptions.imports)
    .concat(globalOptions.configurationModule)) {
    // load configuration and component
    if (configurationModule) {
      applicationContext.load(configurationModule);
    }
  }

  // bind user code module
  applicationContext.ready();

  if (globalOptions.globalConfig) {
    if (Array.isArray(globalOptions.globalConfig)) {
      configService.add(globalOptions.globalConfig);
    } else {
      configService.addObject(globalOptions.globalConfig);
    }
  }

  // merge config
  configService.load();
  debug('[core]: Current config = %j', configService.getConfiguration());

  // middleware support
  applicationContext.get(MidwayMiddlewareService, [applicationContext]);
  return applicationContext;
}
