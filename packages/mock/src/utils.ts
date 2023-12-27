import {
  IMidwayContainer,
  IMidwayFramework,
  Configuration,
  loadModule,
} from '@midwayjs/core';
import { ComponentModule } from './interface';
import * as os from 'os';
import * as assert from 'assert';
import * as fs from 'fs';

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
export async function transformFrameworkToConfiguration<
  T extends IMidwayFramework<any, any, any>
>(
  Framework: any,
  loadMode: 'commonjs' | 'esm'
): Promise<{
  [key: string]: any;
  Configuration: any;
}> {
  if (!Framework) return null;
  let CustomFramework = Framework;
  if (typeof Framework === 'string') {
    Framework = await loadModule(Framework, {
      loadMode,
      safeLoad: true,
    });
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

export async function removeFile(file: string) {
  try {
    await fs.promises.access(file, fs.constants.W_OK);
    await fs.promises.unlink(file);
  } catch {
    // ignore
  }
}

export function mergeGlobalConfig(
  globalConfig,
  newConfigObject: Record<string, any>
) {
  if (globalConfig) {
    if (Array.isArray(globalConfig)) {
      globalConfig.push({
        default: {
          ...newConfigObject,
        },
      });
    } else {
      globalConfig = {
        ...newConfigObject,
        ...globalConfig,
      };
    }
  } else {
    globalConfig = {
      ...newConfigObject,
    };
  }

  return globalConfig;
}

/**
 * // 实现一个命令参数处理工具 parser，将 --port 8080 转换为 { port: 8080 }, --ssl 转换为 { ssl: true }
 * @param argv
 */
export function processArgsParser(argv: string[]) {
  const args = argv.slice(2);
  const result = {};
  args.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[index + 1];
      if (!nextArg || nextArg.startsWith('--')) {
        result[key] = true;
      } else {
        result[key] = nextArg;
      }
    }
  });
  return result;
}
