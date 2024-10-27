import {
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
  ESModuleFileDetector,
  CommonJSFileDetector,
  loadModule,
  safeRequire,
  isTypeScriptEnvironment,
  MidwayPriorityManager,
} from './';
import defaultConfig from './config/config.default';
import {
  bindContainer,
  clearBindContainer,
  listPreloadModule,
} from './decorator';
import * as util from 'util';
import { MidwayServerlessFunctionService } from './service/slsFunctionService';
import { join } from 'path';
import { MidwayHealthService } from './service/healthService';
import { MidwayInitializerPerformanceManager } from './common/performanceManager';
const debug = util.debuglog('midway:debug');

let stepIdx = 1;
function printStepDebugInfo(stepInfo: string) {
  debug(`\n\nStep ${stepIdx++}: ${stepInfo}\n`);
}

/**
 * midway framework main entry, this method bootstrap all service and framework.
 * @param globalOptions
 */
export async function initializeGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
): Promise<IMidwayContainer> {
  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.INITIALIZE
  );

  const applicationContext = await prepareGlobalApplicationContextAsync(
    globalOptions
  );

  printStepDebugInfo('Init logger');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.LOGGER_PREPARE
  );

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

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.LOGGER_PREPARE
  );

  printStepDebugInfo('Init MidwayMockService');

  // mock support
  await applicationContext.getAsync(MidwayMockService, [applicationContext]);

  printStepDebugInfo('Init framework');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.FRAMEWORK_PREPARE
  );

  // framework/config/plugin/logger/app decorator support
  await applicationContext.getAsync(MidwayFrameworkService, [
    applicationContext,
    globalOptions,
  ]);

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.FRAMEWORK_PREPARE
  );

  printStepDebugInfo('Init lifecycle');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.LIFECYCLE_PREPARE
  );

  // lifecycle support
  await applicationContext.getAsync(MidwayLifeCycleService, [
    applicationContext,
  ]);

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.LIFECYCLE_PREPARE
  );

  printStepDebugInfo('Init preload modules');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.PRELOAD_MODULE_PREPARE
  );

  // some preload module init
  const modules = listPreloadModule();
  for (const module of modules) {
    // preload init context
    await applicationContext.getAsync(module);
  }

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.PRELOAD_MODULE_PREPARE
  );

  printStepDebugInfo('End of initialize and start');

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.INITIALIZE
  );

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
  performance.clearMarks();
  performance.clearMeasures();

  global['MIDWAY_APPLICATION_CONTEXT'] = undefined;
  global['MIDWAY_MAIN_FRAMEWORK'] = undefined;
}

/**
 * prepare applicationContext
 * @param globalOptions
 */
export async function prepareGlobalApplicationContextAsync(
  globalOptions: IMidwayBootstrapOptions
) {
  printStepDebugInfo('Ready to create applicationContext');

  debug('[core]: start "initializeGlobalApplicationContext"');
  debug(`[core]: bootstrap options = ${util.inspect(globalOptions)}`);
  const appDir = globalOptions.appDir ?? '';
  const baseDir = globalOptions.baseDir ?? '';

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE
  );

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

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE
  );

  debug('[core]: set default file detector');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE
  );

  printStepDebugInfo('Ready module detector');

  if (!globalOptions.moduleLoadType) {
    globalOptions.moduleLoadType = 'commonjs';
  }

  // set module detector
  if (globalOptions.moduleDetector !== false) {
    debug('[core]: set module load type = %s', globalOptions.moduleLoadType);

    // set default entry file
    if (!globalOptions.imports) {
      globalOptions.imports = [
        await loadModule(
          join(
            baseDir,
            `configuration${isTypeScriptEnvironment() ? '.ts' : '.js'}`
          ),
          {
            loadMode: globalOptions.moduleLoadType,
            safeLoad: true,
          }
        ),
      ];
    }
    if (globalOptions.moduleDetector === undefined) {
      if (globalOptions.moduleLoadType === 'esm') {
        applicationContext.setFileDetector(
          new ESModuleFileDetector({
            loadDir: baseDir,
            ignore: globalOptions.ignore ?? [],
          })
        );
        globalOptions.moduleLoadType = 'esm';
      } else {
        applicationContext.setFileDetector(
          new CommonJSFileDetector({
            loadDir: baseDir,
            ignore: globalOptions.ignore ?? [],
          })
        );
      }
    }
  }

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE
  );

  printStepDebugInfo('Binding inner service');

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
  applicationContext.bindClass(MidwayHealthService);
  applicationContext.bindClass(MidwayPriorityManager);

  printStepDebugInfo('Binding preload module');

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  printStepDebugInfo(
    'Init MidwayConfigService, MidwayAspectService and MidwayDecoratorService'
  );

  // init default environment
  const environmentService = applicationContext.get(MidwayEnvironmentService);
  environmentService.setModuleLoadType(globalOptions.moduleLoadType);

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

  printStepDebugInfo(
    'Load imports(component) and user code configuration module'
  );

  applicationContext.load(
    [].concat(globalOptions.imports).concat(globalOptions.configurationModule)
  );

  printStepDebugInfo('Run applicationContext ready method');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE
  );

  // bind user code module
  await applicationContext.ready();

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE
  );

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD
  );

  if (globalOptions.globalConfig) {
    if (Array.isArray(globalOptions.globalConfig)) {
      configService.add(globalOptions.globalConfig);
    } else {
      configService.addObject(globalOptions.globalConfig);
    }
  }

  printStepDebugInfo('Load config file');

  // merge config
  configService.load();
  debug('[core]: Current config = %j', configService.getConfiguration());

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD
  );

  // middleware support
  applicationContext.get(MidwayMiddlewareService, [applicationContext]);

  return applicationContext;
}

/**
 * prepare applicationContext, it use in egg framework, hooks and serverless function generator
 * @param globalOptions
 */
export function prepareGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
) {
  printStepDebugInfo('Ready to create applicationContext');

  debug('[core]: start "initializeGlobalApplicationContext"');
  debug(`[core]: bootstrap options = ${util.inspect(globalOptions)}`);
  const appDir = globalOptions.appDir ?? '';
  const baseDir = globalOptions.baseDir ?? '';

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE
  );

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

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE
  );

  printStepDebugInfo('Ready module detector');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE
  );

  if (!globalOptions.moduleLoadType) {
    globalOptions.moduleLoadType = 'commonjs';
  }

  if (globalOptions.moduleDetector !== false) {
    if (globalOptions.moduleDetector === undefined) {
      applicationContext.setFileDetector(
        new CommonJSFileDetector({
          ignore: globalOptions.ignore ?? [],
        })
      );
    } else if (globalOptions.moduleDetector) {
      applicationContext.setFileDetector(globalOptions.moduleDetector);
    }
  }

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE
  );

  printStepDebugInfo('Binding inner service');

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
  applicationContext.bindClass(MidwayHealthService);
  applicationContext.bindClass(MidwayPriorityManager);

  printStepDebugInfo('Binding preload module');

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  printStepDebugInfo(
    'Init MidwayConfigService, MidwayAspectService and MidwayDecoratorService'
  );

  // init default environment
  const environmentService = applicationContext.get(MidwayEnvironmentService);
  environmentService.setModuleLoadType(globalOptions.moduleLoadType);

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

  printStepDebugInfo(
    'Load imports(component) and user code configuration module'
  );

  if (!globalOptions.imports) {
    globalOptions.imports = [
      safeRequire(join(globalOptions.baseDir, 'configuration')),
    ];
  }

  applicationContext.load(
    [].concat(globalOptions.imports).concat(globalOptions.configurationModule)
  );

  printStepDebugInfo('Run applicationContext ready method');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE
  );

  // bind user code module
  applicationContext.ready();

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE
  );

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD
  );

  if (globalOptions.globalConfig) {
    if (Array.isArray(globalOptions.globalConfig)) {
      configService.add(globalOptions.globalConfig);
    } else {
      configService.addObject(globalOptions.globalConfig);
    }
  }

  printStepDebugInfo('Load config file');

  // merge config
  configService.load();
  debug('[core]: Current config = %j', configService.getConfiguration());

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD
  );

  // middleware support
  applicationContext.get(MidwayMiddlewareService, [applicationContext]);
  return applicationContext;
}
