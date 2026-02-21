import type { MidwayCoreDefaultConfig } from '../interface';
import { getCurrentEnvironment, isDevelopmentEnvironment } from '../util/';

export default (): MidwayCoreDefaultConfig => {
  const isDevelopment = isDevelopmentEnvironment(getCurrentEnvironment());
  return {
    core: {
      healthCheckTimeout: 1_000,
      configLoadTimeout: 10_000,
      readyTimeout: 30_000,
      serverReadyTimeout: 30_000,
    },
    asyncContextManager: {
      enable: true,
    },
    tracing: {
      enable: true,
      protocols: {},
      onError: 'ignore',
      logOnError: false,
    },
    midwayLogger: {
      default: {
        level: 'info',
      },
      clients: {
        coreLogger: {
          level: isDevelopment ? 'info' : 'warn',
        },
        appLogger: {
          aliasName: 'logger',
        },
      },
    },
    debug: {
      recordConfigMergeOrder: isDevelopment,
    },
  };
};
