import { basename, join } from 'path';
import { sync as findUpSync, stop } from 'find-up';
import { existsSync } from 'fs';
import {
  DirectoryFileDetector,
  getCurrentApplicationContext,
  IMidwayBootstrapOptions,
  MidwayAspectService,
  MidwayConfigService,
  MidwayContainer,
  MidwayDecoratorService,
  MidwayEnvironmentService,
  MidwayInformationService,
  MidwayLoggerService,
  MidwayPipelineService,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core';
import {
  ALL,
  APPLICATION_KEY,
  bindContainer,
  CONFIG_KEY,
  LOGGER_KEY,
  PIPELINE_IDENTIFIER,
  PLUGIN_KEY,
} from '@midwayjs/decorator';
import { MidwayWebFramework } from './framework/web';
import { debuglog } from 'util';

const debug = debuglog('midway:debug');

export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

export const parseNormalDir = (baseDir: string, isTypescript = true) => {
  if (isTypescript) {
    // 这里要么就是 src 目录，要么就已经是根目录
    if (!existsSync(join(baseDir, 'package.json'))) {
      baseDir = basename(baseDir);
    }

    const isTypeScriptEnv = isTypeScriptEnvironment();

    if (isTypeScriptEnv) {
      return {
        baseDir: join(baseDir, 'src'),
        appDir: baseDir,
      };
    } else {
      return {
        baseDir: join(baseDir, 'dist'),
        appDir: baseDir,
      };
    }
  } else {
    // js baseDir
    return {
      baseDir,
      appDir: baseDir,
    };
  }
};

export const findLernaRoot = (findRoot = process.cwd()) => {
  const userHome = process.env.HOME;
  return findUpSync(
    directory => {
      if (findUpSync.exists(join(directory, 'lerna.json'))) {
        return directory;
      }
      if (directory === userHome) {
        return stop;
      }
    },
    { cwd: findRoot, type: 'directory' }
  );
};

export const getCurrentDateString = (timestamp: number = Date.now()) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

export async function initializeAgentApplicationContext(
  agent,
  globalOptions: Omit<IMidwayBootstrapOptions, 'applicationContext'>
) {
  if (!getCurrentApplicationContext()) {
    debug('[egg]: start "initializeGlobalApplicationContext"');
    const appDir = globalOptions.appDir ?? '';
    const baseDir = globalOptions.baseDir ?? '';
    // new container
    const applicationContext = new MidwayContainer();
    debug('[egg]: delegate module map from decoratorManager');
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

    // bind preload module
    if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
      for (const preloadModule of globalOptions.preloadModules) {
        applicationContext.bindClass(preloadModule);
      }
    }

    // init default config
    const configService = await applicationContext.getAsync(
      MidwayConfigService
    );
    // add egg config here, it will be ignore midway and component config
    configService.add([
      {
        default: agent.config,
      },
    ]);

    // init aop support
    const aspectService = await applicationContext.getAsync(
      MidwayAspectService,
      [applicationContext]
    );

    // init decorator service
    const decoratorService = await applicationContext.getAsync(
      MidwayDecoratorService,
      [applicationContext]
    );

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
    debug('[core]: Current config = %j', configService.getConfiguration());

    // init logger
    await applicationContext.getAsync(MidwayLoggerService, [
      applicationContext,
    ]);

    // framework/config/plugin/logger/app decorator support
    // register base config hook
    decoratorService.registerPropertyHandler(
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
    decoratorService.registerPropertyHandler(
      LOGGER_KEY,
      (propertyName, meta) => {
        return this.loggerService.getLogger(meta.identifier ?? propertyName);
      }
    );

    decoratorService.registerPropertyHandler(
      PIPELINE_IDENTIFIER,
      (key, meta, instance) => {
        return new MidwayPipelineService(
          instance[REQUEST_OBJ_CTX_KEY]?.requestContext ??
            this.applicationContext,
          meta.valves
        );
      }
    );

    // register @App decorator handler
    decoratorService.registerPropertyHandler(
      APPLICATION_KEY,
      (propertyName, mete) => {
        return agent;
      }
    );

    decoratorService.registerPropertyHandler(PLUGIN_KEY, (key, target) => {
      return this.agent[key];
    });

    // init aspect module
    await aspectService.loadAspect();
  } else {
    debug(
      '[egg]: "initializeAgentApplicationContext" ignore re-init in single process'
    );
  }

  const applicationContext = getCurrentApplicationContext();

  const agentFramework = new MidwayWebFramework(applicationContext);
  agentFramework.app = agent;
  agentFramework.configService = applicationContext.get(MidwayConfigService);
  agentFramework.overwriteApplication('agent');

  return applicationContext;
}
