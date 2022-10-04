import {
  IMidwayContainer,
  IMidwayFramework,
  safeRequire,
  Configuration,
} from '@midwayjs/core';
import { ComponentModule } from './interface';
import * as os from 'os';
import * as assert from 'assert';

export function isTestEnvironment() {
  const testEnv = ['test', 'unittest'];
  return (
    testEnv.includes(process.env.MIDWAY_SERVER_ENV) ||
    testEnv.includes(process.env.EGG_SERVER_ENV) ||
    testEnv.includes(process.env.NODE_ENV)
  );
}

export function isWin32() {
  return os.platform() === 'win32';
}

export function findFirstExistModule(moduleList): ComponentModule {
  for (const name of moduleList) {
    if (!name) continue;
    try {
      return require(name);
    } catch (e) {
      // ignore
    }
  }
}

/**
 * transform a framework component or framework module to configuration class
 * @param Framework
 */
export function transformFrameworkToConfiguration<
  T extends IMidwayFramework<any, any, any>
>(
  Framework: any
): {
  [key: string]: any;
  Configuration: any;
} {
  if (!Framework) return null;
  let CustomFramework = Framework;
  if (typeof Framework === 'string') {
    Framework = safeRequire(Framework);
  }

  if (Framework.Configuration) {
    return Framework;
  }

  if (Framework.Framework) {
    CustomFramework = Framework.Framework;
  } else {
    CustomFramework = Framework;
  }

  assert(CustomFramework, `can't found custom framework ${Framework}`);

  @Configuration()
  class CustomConfiguration {
    async onServerReady(container: IMidwayContainer) {
      const customFramework = (await container.getAsync<T>(
        CustomFramework as any
      )) as T;
      await customFramework.run();
    }
  }

  return {
    Configuration: CustomConfiguration,
    Framework,
  };
}
