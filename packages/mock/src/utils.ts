import {
  IMidwayContainer,
  IMidwayFramework,
  safeRequire,
} from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
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

export function findFirstExistModule(moduleList): string {
  for (const name of moduleList) {
    if (!name) continue;
    try {
      require.resolve(name);
      return name;
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
  T extends IMidwayFramework<any, any>
>(
  Framework: any
): {
  [key: string]: any;
  Configuration: any;
} {
  let CustomFramework = Framework;
  if (typeof Framework === 'string') {
    Framework = safeRequire(Framework);
  }

  if (Framework.Configuration) {
    return Framework.Configuration;
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
