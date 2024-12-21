import { basename, join } from 'path';
import { sync as findUpSync, stop } from 'find-up';
import { existsSync } from 'fs';
import {
  getCurrentApplicationContext,
  MidwayAspectService,
  MidwayConfigService,
  MidwayDecoratorService,
  MidwayLoggerService,
  MidwayEnvironmentService,
  MidwayInformationService,
  isTypeScriptEnvironment,
  MAIN_APPLICATION_KEY,
} from '@midwayjs/core';
import {
  ALL_VALUE_KEY,
  APPLICATION_KEY,
  CONFIG_KEY,
  LOGGER_KEY,
  PLUGIN_KEY,
} from '@midwayjs/core';
import { MidwayWebFramework } from './framework/web';
import { debuglog } from 'util';
import { EGG_AGENT_APP_KEY } from './interface';

const debug = debuglog('midway:debug');

export const parseNormalDir = (baseDir: string, isTypescript = true) => {
  if (isTypescript) {
    // 这里要么就是 src 目录，要么就已经是根目录
    if (!existsSync(join(baseDir, 'package.json'))) {
      baseDir = basename(baseDir);
    }

    const isTypeScriptEnv = isTypeScriptEnvironment();

    if (isTypeScriptEnv) {
      return {
        baseDir: join(baseDir, process.env.MIDWAY_SOURCE_DIR || 'src'),
        appDir: baseDir,
      };
    } else {
      return {
        baseDir: join(baseDir, process.env.MIDWAY_SOURCE_DIR || 'dist'),
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

export async function initializeAgentApplicationContext(agent) {
  const applicationContext = getCurrentApplicationContext();
  const agentFramework = new MidwayWebFramework(applicationContext);
  agentFramework['logger'] = agent.coreLogger;
  agentFramework['appLogger'] = agent.logger;
  agentFramework.app = agent;
  agentFramework.configService = applicationContext.get(MidwayConfigService);
  agentFramework.environmentService = applicationContext.get(
    MidwayEnvironmentService
  );
  agentFramework.loggerService = applicationContext.get(MidwayLoggerService);
  agentFramework.loggerService.initSync();
  agentFramework.informationService = applicationContext.get(
    MidwayInformationService
  );
  agentFramework.overwriteApplication('agent');

  // init decorator service
  const decoratorService = getCurrentApplicationContext().get(
    MidwayDecoratorService
  );

  // register @Logger decorator handler
  decoratorService.registerPropertyHandler(
    EGG_AGENT_APP_KEY,
    (propertyName, meta) => {
      return agent;
    }
  );

  if (process.env['EGG_CLUSTER_MODE'] === 'true') {
    // init aop support
    const aspectService =
      getCurrentApplicationContext().get(MidwayAspectService);

    const configService =
      getCurrentApplicationContext().get(MidwayConfigService);

    const loggerService =
      getCurrentApplicationContext().get(MidwayLoggerService);

    loggerService.initSync();

    // framework/config/plugin/logger/app decorator support
    // register base config hook
    decoratorService.registerPropertyHandler(
      CONFIG_KEY,
      (propertyName, meta) => {
        if (meta.identifier === ALL_VALUE_KEY) {
          return configService.getConfiguration();
        } else {
          return configService.getConfiguration(
            meta.identifier ?? propertyName
          );
        }
      }
    );

    // register @Logger decorator handler
    decoratorService.registerPropertyHandler(
      LOGGER_KEY,
      (propertyName, meta) => {
        return loggerService.getLogger(meta.identifier ?? propertyName);
      }
    );

    // register @App decorator handler
    decoratorService.registerPropertyHandler(
      APPLICATION_KEY,
      (propertyName, mete) => {
        return agent;
      }
    );

    // register @MainApp decorator handler
    decoratorService.registerPropertyHandler(
      MAIN_APPLICATION_KEY,
      (key, target) => {
        return agent;
      }
    );

    // register @Plugin decorator handler
    decoratorService.registerPropertyHandler(PLUGIN_KEY, (key, target) => {
      return agent[key];
    });

    // init aspect module
    await aspectService.loadAspect();
    debug(
      '[egg]: added extra for "initializeAgentApplicationContext" in cluster mode'
    );
  } else {
    debug(
      '[egg]: "initializeAgentApplicationContext" ignore re-init in single process'
    );
  }

  return applicationContext;
}
