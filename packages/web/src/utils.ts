import { basename, join } from 'path';
import { sync as findUpSync, stop } from 'find-up';
import { existsSync } from 'fs';
import {
  getCurrentApplicationContext,
  MidwayAspectService,
  MidwayConfigService,
  MidwayDecoratorService,
  MidwayPipelineService,
  MidwayLoggerService,
  REQUEST_OBJ_CTX_KEY,
  MidwayEnvironmentService,
  MidwayInformationService,
} from '@midwayjs/core';
import {
  ALL,
  APPLICATION_KEY,
  CONFIG_KEY,
  LOGGER_KEY,
  PIPELINE_IDENTIFIER,
  PLUGIN_KEY,
} from '@midwayjs/core';
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

export async function initializeAgentApplicationContext(agent) {
  const applicationContext = getCurrentApplicationContext();
  const agentFramework = new MidwayWebFramework(applicationContext);
  agentFramework['logger'] = agent.logger;
  agentFramework['appLogger'] = agent.coreLogger;
  agentFramework.app = agent;
  agentFramework.configService = applicationContext.get(MidwayConfigService);
  agentFramework.environmentService = applicationContext.get(
    MidwayEnvironmentService
  );
  agentFramework.loggerService = applicationContext.get(MidwayLoggerService);
  agentFramework.informationService = applicationContext.get(
    MidwayInformationService
  );
  agentFramework.overwriteApplication('agent');

  if (process.env['EGG_CLUSTER_MODE'] === 'true') {
    // init aop support
    const aspectService =
      getCurrentApplicationContext().get(MidwayAspectService);

    // init decorator service
    const decoratorService = getCurrentApplicationContext().get(
      MidwayDecoratorService
    );

    const configService =
      getCurrentApplicationContext().get(MidwayConfigService);

    const loggerService =
      getCurrentApplicationContext().get(MidwayLoggerService);

    // framework/config/plugin/logger/app decorator support
    // register base config hook
    decoratorService.registerPropertyHandler(
      CONFIG_KEY,
      (propertyName, meta) => {
        if (meta.identifier === ALL) {
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
