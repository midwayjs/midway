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
import { Configuration, Framework, sleep } from '@midwayjs/decorator';
import { clearAllLoggers } from '@midwayjs/logger';
import * as os from 'os';
import * as assert from 'assert';

type ComponentModule = {
  Configuration: new () => any;
};

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
  configurationModule?: any | any[];
};

export async function create<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(
  appDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<T> {
  process.env.MIDWAY_TS_MODE = 'true';

  // 处理测试的 fixtures
  if (!isAbsolute(appDir)) {
    appDir = join(process.cwd(), 'test', 'fixtures', appDir);
  }
  clearAllLoggers();

  options = options || ({} as any);
  if (options.baseDir) {
    safeRequire(join(`${options.baseDir}`, 'interface'));
  } else {
    options.baseDir = `${appDir}/src`;
    safeRequire(join(`${options.baseDir}`, 'interface'));
  }

  if (!options.configurationModule && customFramework) {
    options.configurationModule =
      transformFrameworkToConfiguration(customFramework);
  }

  if (customFramework?.['Configuration']) {
    options.configurationModule = customFramework;
    customFramework = customFramework['Framework'];
  }

  const container = await initializeGlobalApplicationContext({
    ...options,
    appDir,
    configurationModule: []
      .concat(options.configurationModule)
      .concat(safeRequire(join(options.baseDir, 'configuration'))),
  });

  if (customFramework) {
    return container.getAsync(customFramework as any);
  } else {
    const frameworkService = await container.getAsync(MidwayFrameworkService);
    return frameworkService.getMainFramework() as T;
  }
}

export async function createApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<IMidwayApplication<any, any>> {
  const framework: T = await create<T, U>(baseDir, options, customFramework);
  return framework.getApplication() as unknown as Y;
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

  const framework = await createApp(baseDir, {
    ...options,
    configurationModule: transformFrameworkToConfiguration(customFramework),
  });
  framework.configurationOptions = options;
  return framework;
}

export async function createLightApp(
  baseDir = '',
  options?: MockAppConfigurationOptions
): Promise<IMidwayApplication> {
  /**
   * 一个全量的空框架
   */
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

    configure(): any {
      return {};
    }
  }

  return createApp(baseDir, {
    ...options,
    configurationModule: [
      transformFrameworkToConfiguration(LightFramework),
    ].concat(options.configurationModule),
  });
}

/**
 * transform a framework component or framework module to configuration class
 * @param Framework
 */
function transformFrameworkToConfiguration<
  T extends IMidwayFramework<any, any>
>(Framework: any): new () => any {
  let CustomFramework = Framework;
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
