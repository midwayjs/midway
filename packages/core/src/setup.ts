import {
  MidwayConfigService,
  MidwayContainer,
  MidwayEnvironmentService,
  MidwayInformationService,
  IMidwayBootstrapOptions,
  MidwayLoggerService,
  MidwayFrameworkService,
  MidwayAspectService,
  MidwayLifeCycleService,
  MidwayMiddlewareService,
  MidwayDecoratorService,
  MidwayApplicationManager,
  MidwayMockService,
  MidwayWebRouterService,
  MidwayPriorityManager,
  DecoratorManager,
  IMidwayGlobalContainer,
} from './';
import defaultConfig from './config/config.default';
import * as util from 'util';
import { MidwayServerlessFunctionService } from './service/slsFunctionService';
import { MidwayHealthService } from './service/healthService';
import { ComponentConfigurationLoader } from './context/componentLoader';
import { findProjectEntryFile, findProjectEntryFileSync } from './util';
import { AsyncLocalStorageContextManager } from './common/asyncContextManager';
import {
  MidwayInitializerPerformanceManager,
  MidwayPerformanceManager,
} from './common/performanceManager';
const debug = util.debuglog('midway:debug');

let stepIdx = 1;
let projectIdx = 1;
function printStepDebugInfo(stepInfo: string) {
  debug(`\n\nProject ${projectIdx} - Step ${stepIdx++}: ${stepInfo}\n`);
}

/**
 * midway framework main entry, this method bootstrap all service and framework.
 * @param globalOptions
 */
export async function initializeGlobalApplicationContext(
  globalOptions: IMidwayBootstrapOptions
): Promise<IMidwayGlobalContainer> {
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

  printStepDebugInfo('Init pre-start modules');

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.PRELOAD_MODULE_PREPARE
  );

  // some pre-start module init
  const modules = DecoratorManager.listPreStartModule();
  for (const module of modules) {
    // pre-start init context
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
  applicationContext: IMidwayGlobalContainer
) {
  printStepDebugInfo('Ready to destroy applicationContext');
  const loggerService = await applicationContext.getAsync(MidwayLoggerService);
  const loggerFactory = loggerService.getCurrentLoggerFactory();

  printStepDebugInfo('Stopping lifecycle');
  // stop lifecycle
  const lifecycleService = await applicationContext.getAsync(
    MidwayLifeCycleService
  );
  await lifecycleService.stop();

  printStepDebugInfo('Stopping applicationContext');
  // stop container
  await applicationContext.stop();

  printStepDebugInfo('Closing loggerFactory');
  loggerFactory.close();

  printStepDebugInfo('Cleaning performance manager');
  MidwayPerformanceManager.cleanAll();

  global['MIDWAY_APPLICATION_CONTEXT'] = undefined;
  global['MIDWAY_MAIN_FRAMEWORK'] = undefined;

  // reset counter
  stepIdx = 1;
  projectIdx++;
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

  global['MIDWAY_APPLICATION_CONTEXT'] = applicationContext;

  // register baseDir and appDir
  applicationContext.registerObject('baseDir', baseDir);
  applicationContext.registerObject('appDir', appDir);

  if (!globalOptions.asyncContextManager) {
    globalOptions.asyncContextManager = new AsyncLocalStorageContextManager();
  }

  debug('[core]: set default module load type and entry file');
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

  // set entry file
  globalOptions.imports = [
    ...(globalOptions.imports ?? []),
    await findProjectEntryFile(appDir, baseDir, globalOptions.moduleLoadType),
  ];

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DETECTOR_PREPARE
  );

  printStepDebugInfo('Binding built-in service');

  // bind built-in service
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

  printStepDebugInfo('Binding preload module');

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  printStepDebugInfo(
    'Load imports(component) and user code configuration module'
  );

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE
  );

  // load configuration
  const componentConfigurationLoader = new ComponentConfigurationLoader(
    applicationContext
  );
  const importModules = [...(globalOptions.imports ?? [])];

  for (const mod of importModules) {
    if (mod) {
      await componentConfigurationLoader.load(mod);
    }
  }

  for (const ns of componentConfigurationLoader.getNamespaceList()) {
    applicationContext.addNamespace(ns);
    debug(`[core]: load configuration in namespace="${ns}" complete`);
  }

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

  global['MIDWAY_APPLICATION_CONTEXT'] = applicationContext;

  // register baseDir and appDir
  applicationContext.registerObject('baseDir', baseDir);
  applicationContext.registerObject('appDir', appDir);

  if (!globalOptions.asyncContextManager) {
    globalOptions.asyncContextManager = new AsyncLocalStorageContextManager();
  }

  MidwayInitializerPerformanceManager.markEnd(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.METADATA_PREPARE
  );

  debug('[core]: set default module load type and entry file');

  if (!globalOptions.moduleLoadType) {
    globalOptions.moduleLoadType = 'commonjs';
  }

  // set entry file
  globalOptions.imports = [
    ...(globalOptions.imports ?? []),
    findProjectEntryFileSync(appDir, baseDir),
  ];

  printStepDebugInfo('Binding built-in service');

  // bind built-in service
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

  printStepDebugInfo('Binding preload module');

  // bind preload module
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  printStepDebugInfo(
    'Load imports(component) and user code configuration module'
  );

  // load configuration
  const componentConfigurationLoader = new ComponentConfigurationLoader(
    applicationContext
  );
  const importModules = [...(globalOptions.imports ?? [])];

  MidwayInitializerPerformanceManager.markStart(
    MidwayInitializerPerformanceManager.MEASURE_KEYS.DEFINITION_PREPARE
  );

  for (const mod of importModules) {
    if (mod) {
      componentConfigurationLoader.loadSync(mod);
    }
  }

  for (const ns of componentConfigurationLoader.getNamespaceList()) {
    applicationContext.addNamespace(ns);
    debug(`[core]: load configuration in namespace="${ns}" complete`);
  }

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
