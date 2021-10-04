import {
  BaseFramework,
  destroyGlobalApplicationContext,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayContainer,
  IMidwayFramework,
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
  MidwayFrameworkType,
  safeRequire,
} from '@midwayjs/core';
import { isAbsolute, join } from 'path';
import { remove } from 'fs-extra';
import {
  clearAllModule,
  Configuration,
  Framework,
  Provide,
  sleep,
} from '@midwayjs/decorator';
import { clearAllLoggers } from '@midwayjs/logger';
import * as os from 'os';
import * as assert from 'assert';

process.setMaxListeners(0);

function isTestEnvironment() {
  const testEnv = ['test', 'unittest'];
  return (
    testEnv.includes(process.env.MIDWAY_SERVER_ENV) ||
    testEnv.includes(process.env.EGG_SERVER_ENV) ||
    testEnv.includes(process.env.NODE_ENV)
  );
}

function isWin32() {
  return os.platform() === 'win32';
}

function findFirstExistModule(moduleList): string {
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

export type MockAppConfigurationOptions = {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  entryFile?: string;
  baseDir?: string;
  bootstrapTimeout?: number;
  configurationModule?: any;
};

let lastAppDir;

export async function create(
  appDir: string = process.cwd(),
  options?: MockAppConfigurationOptions
): Promise<IMidwayApplication<any, any>> {
  process.env.MIDWAY_TS_MODE = 'true';

  // 处理测试的 fixtures
  if (!isAbsolute(appDir)) {
    appDir = join(process.cwd(), 'test', 'fixtures', appDir);
  }

  if (lastAppDir && lastAppDir !== appDir) {
    // 当目录不同才清理缓存，相同目录的装饰器只加载一次，清理了就没了
    clearAllModule();
  }
  lastAppDir = appDir;
  global['MIDWAY_BOOTSTRAP_APP_SET'].clear();
  // clearContainerCache();
  clearAllLoggers();

  options = options || ({} as any);
  if (options.baseDir) {
    safeRequire(join(`${options.baseDir}`, 'interface'));
  } else {
    safeRequire(join(`${appDir}`, 'src/interface'));
  }

  options = options ?? {};

  const container = await initializeGlobalApplicationContext({
    baseDir: options.baseDir,
    appDir,
    configurationModule: [
      safeRequire(join(options.baseDir, 'configuration')),
    ].concat(options.configurationModule),
  });

  const frameworkService = await container.getAsync(MidwayFrameworkService);
  return frameworkService.getMainApp();
}

export async function createApp(
  baseDir: string = process.cwd(),
  options?: MockAppConfigurationOptions
): Promise<IMidwayApplication<any, any>> {
  return create(baseDir, options);
}

export async function close(
  app: IMidwayApplication,
  options?: {
    cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
  }
) {
  if (!app) return;
  options = options || {};
  await destroyGlobalApplicationContext(app.getApplicationContext());
  if (isTestEnvironment()) {
    // clean first
    if (options.cleanLogsDir && !isWin32()) {
      await remove(join(app.getAppDir(), 'logs'));
    }
    if (MidwayFrameworkType.WEB === app.getFrameworkType()) {
      if (options.cleanTempDir && !isWin32()) {
        await remove(join(app.getAppDir(), 'run'));
      }
    }
    if (options.sleep > 0) {
      await sleep(options.sleep);
    } else {
      await sleep(50);
    }
  }
}

export async function createFunctionApp(
  baseDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<IMidwayApplication> {
  const customFramework =
    customFrameworkName ??
    findFirstExistModule([
      process.env.MIDWAY_SERVERLESS_APP_NAME,
      '@ali/serverless-app',
      '@midwayjs/serverless-app',
    ]);

  return create(baseDir, {
    ...options,
    configurationModule: transformFrameworkToConfiguration(customFramework),
  });
}

export async function createLightApp(
  baseDir: string = process.cwd(),
  options?: MockAppConfigurationOptions
): Promise<IMidwayApplication> {
  /**
   * 一个全量的空框架
   */
  @Provide()
  @Framework()
  class LightFramework extends BaseFramework<any, any, any> {
    getFrameworkType(): MidwayFrameworkType {
      return MidwayFrameworkType.LIGHT;
    }

    async run(): Promise<void> {}

    async applicationInitialize(options: IMidwayBootstrapOptions) {
      this.app = {} as IMidwayApplication;
      this.defineApplicationProperties();
    }
  }

  return create(baseDir, {
    ...options,
    configurationModule: transformFrameworkToConfiguration(LightFramework),
  });
}

/**
 * transform a framework component or framework module to configuration class
 * @param Framework
 */
function transformFrameworkToConfiguration<
  T extends IMidwayFramework<any, any>
>(Framework: any): new () => any {
  let CustomFramework;
  if (typeof Framework === 'string') {
    const frameworkModule = safeRequire(Framework);
    CustomFramework = frameworkModule.Framework;
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

  return CustomConfiguration;
}
