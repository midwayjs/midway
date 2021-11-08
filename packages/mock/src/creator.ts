import {
  BaseFramework,
  destroyGlobalApplicationContext,
  DirectoryFileDetector,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayFramework,
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
  MidwayFrameworkType,
  safeRequire,
} from '@midwayjs/core';
import { isAbsolute, join } from 'path';
import { remove } from 'fs-extra';
import { Framework, sleep } from '@midwayjs/decorator';
import { clearAllLoggers } from '@midwayjs/logger';
import { ComponentModule, MockAppConfigurationOptions } from './interface';
import {
  findFirstExistModule,
  isTestEnvironment,
  isWin32,
  transformFrameworkToConfiguration,
} from './utils';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

const usedModuleMap: WeakMap<any, string> = new WeakMap();

process.setMaxListeners(0);

class MockDirectoryFileDetector extends DirectoryFileDetector {
  run(container) {
    debug('[mock]: filter container transform map from decorator');
    const appDir = container.get('appDir');
    for (const moduleMeta of container.moduleMap.values()) {
      for (const value of Array.from(moduleMeta)) {
        const dir = usedModuleMap.get(value);
        // 如果在已经使用过的模块列表中，且他的目录和当前的不同，则需要清理
        if (dir && dir !== appDir) {
          moduleMeta.delete(value);
          debug(`[mock]: filter module ${value}`);
        }
      }
    }
    debug('[mock]: filter end');
    return super.run(container);
  }
}

export async function create<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(
  appDir: string = process.cwd(),
  options?: MockAppConfigurationOptions,
  customFramework?: { new (...args): T } | ComponentModule
): Promise<T> {
  debug(`[mock]: Create app, appDir="${appDir}"`);
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

  if (
    options.moduleDetector === 'file' ||
    options.moduleDetector === undefined
  ) {
    debug(`[mock]: "options.moduleDetector" empty and use default`);
    // 这里设置是因为在 midway 单测中会不断的复用装饰器元信息，又不能清理缓存，所以在这里做一些过滤
    options.moduleDetector = new MockDirectoryFileDetector({
      loadDir: options.baseDir,
      ignore: options.ignore ?? [],
    });
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
  debug(`[mock]: Closing app, appDir=${app.getAppDir()}`);
  options = options || {};
  // save current user module in container to filter in next test case
  const registry = app.getApplicationContext().registry as any;

  for (const definition of registry.values()) {
    if (
      definition?.constructor?.name === 'ObjectDefinition' && !/^Midway/.test(definition?.path?.name)
    ) {
      usedModuleMap.set(definition.path, app.getAppDir());
      debug(`[mock]: set user module "${definition.path.name}" to global filter map`);
    }
  }

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

export async function createLightApp(
  baseDir = '',
  options: MockAppConfigurationOptions = {}
): Promise<IMidwayApplication> {


  return createApp(baseDir, {
    ...options,
    configurationModule: [
      transformFrameworkToConfiguration(LightFramework),
    ].concat(options?.configurationModule),
  });
}
