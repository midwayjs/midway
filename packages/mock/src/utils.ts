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

  assert.ok(CustomFramework, `can't found custom framework ${Framework}`);

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
 * 解析命令行参数的函数。
 * 它接受一个字符串数组作为输入，然后解析这个数组，
 * 将形如 `--key value` 或 `--key=value` 的参数转换为对象的键值对，
 * 形如 `--key` 的参数转换为 `{ key: true }`。
 * @param argv 命令行参数数组
 * @returns 解析后的参数对象
 */
export function processArgsParser(argv: string[]) {
  const args = argv.slice(2);
  const result = {};

  args.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      let value;
      let key = arg.slice(2);
      if (key.includes('=')) {
        [key, value] = key.split('=');
      } else if (args[index + 1] && !args[index + 1].startsWith('--')) {
        value = args[index + 1];
      } else {
        value = true;
      }
      result[key] = value;
    }
  });

  return result;
}
