import { Bootstrap, BootstrapStarter } from '@midwayjs/bootstrap';
import {
  clearContainerCache,
  IMidwayApplication,
  IMidwayFramework,
  MidwayFrameworkType,
  safeRequire,
} from '@midwayjs/core';
import { isAbsolute, join, resolve } from 'path';
import { remove } from 'fs-extra';
import { clearAllModule, sleep } from '@midwayjs/decorator';
import { existsSync } from 'fs';
import { clearAllLoggers } from '@midwayjs/logger';
import * as os from 'os';

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

const appMap = new WeakMap();
const bootstrapAppSet = (global['MIDWAY_BOOTSTRAP_APP_SET'] = new Set<{
  framework: IMidwayFramework<any, any>;
  starter: BootstrapStarter;
}>());

function getIncludeFramework(dependencies): string {
  const currentFramework = [
    '@midwayjs/web',
    '@midwayjs/koa',
    '@midwayjs/express',
    '@midwayjs/serverless-app',
    '@midwayjs/grpc',
    '@midwayjs/rabbitmq',
    '@midwayjs/socketio',
    '@midwayjs/faas',
  ];
  for (const frameworkName of currentFramework) {
    if (dependencies[frameworkName]) {
      return frameworkName;
    }
  }
}

function formatPath(baseDir, p) {
  if (isAbsolute(p)) {
    return p;
  } else {
    return resolve(baseDir, p);
  }
}

export type MockAppConfigurationOptions = {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
  entryFile?: string;
  baseDir?: string;
};

export async function create<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(
  appDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<T> {
  process.env.MIDWAY_TS_MODE = 'true';
  clearAllModule();
  clearContainerCache();
  clearAllLoggers();

  options = options || ({} as any);
  if (options.baseDir) {
    safeRequire(join(`${options.baseDir}`, 'interface'));
  } else {
    safeRequire(join(`${appDir}`, 'src/interface'));
  }

  if (options.entryFile) {
    // start from entry file, like bootstrap.js
    options.entryFile = formatPath(appDir, options.entryFile);
    global['MIDWAY_BOOTSTRAP_APP_READY'] = false;
    // set app in @midwayjs/bootstrap
    require(options.entryFile);

    await new Promise<void>((resolve, reject) => {
      const timeoutHandler = setTimeout(() => {
        clearInterval(internalHandler);
        reject(new Error('[midway]: bootstrap timeout'));
      }, 30 * 1000);
      const internalHandler = setInterval(() => {
        if (global['MIDWAY_BOOTSTRAP_APP_READY'] === true) {
          clearInterval(internalHandler);
          clearTimeout(timeoutHandler);
          resolve();
        }
      }, 200);
    });
    // 这里为了兼容下 cli 的老逻辑
    if (bootstrapAppSet.size) {
      const obj = bootstrapAppSet.values().next().value;
      return obj.framework;
    }
    return;
  }

  let framework: T = null;
  let DefaultFramework;

  // find framework
  if (customFrameworkName) {
    if (typeof customFrameworkName === 'string') {
      DefaultFramework = require(customFrameworkName as string).Framework;
    } else {
      DefaultFramework = customFrameworkName;
    }
  } else {
    // find default framework from pkg
    const pkg = require(join(appDir, 'package.json'));
    if (pkg.dependencies || pkg.devDependencies) {
      customFrameworkName = getIncludeFramework(
        Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {})
      );
    }
    DefaultFramework = require(customFrameworkName as string).Framework;
  }

  options = options ?? ({} as U);

  // got options from framework
  if (DefaultFramework) {
    framework = new DefaultFramework();
    if (framework.getFrameworkType() === MidwayFrameworkType.WEB) {
      // add egg-mock plugin for @midwayjs/web test, provide mock method
      options = Object.assign(options || {}, {
        plugins: {
          'egg-mock': {
            enable: true,
            package: 'egg-mock',
          },
          'midway-mock': {
            enable: true,
            package: '@midwayjs/mock',
          },
          watcher: false,
          development: false,
        },
      }) as any;
    }
    framework.configure(options);
  } else {
    throw new Error('framework not found');
  }

  const starter = new BootstrapStarter();

  if (!isAbsolute(appDir)) {
    appDir = join(process.cwd(), 'test', 'fixtures', appDir);
  }

  if (!existsSync(appDir)) {
    throw new Error(`${appDir} not found`);
  }

  starter
    .configure({
      appDir,
      baseDir: options.baseDir,
    })
    .load(framework as any);

  await starter.init();
  await starter.run();

  appMap.set(framework.getApplication(), starter);

  return framework;
}

export async function createApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | any
): Promise<Y> {
  const framework: T = await create<T, U>(
    baseDir,
    options,
    customFrameworkName
  );
  return (framework.getApplication() as unknown) as Y;
}

export async function close(
  app: IMidwayApplication | IMidwayFramework<any, any>,
  options?: {
    cleanLogsDir?: boolean;
    cleanTempDir?: boolean;
    sleep?: number;
  }
) {
  if (!app) return;
  options = options || {};
  let newApp: IMidwayApplication;
  if ((app as IMidwayFramework<any, any>).getApplication) {
    newApp = (app as IMidwayFramework<any, any>).getApplication();
  } else {
    newApp = app as IMidwayApplication;
  }
  const starter = appMap.get(newApp);
  if (starter) {
    await starter.stop();
    appMap.delete(newApp);
    bootstrapAppSet.clear();
  }

  if (isTestEnvironment()) {
    // clean first
    if (options.cleanLogsDir !== false && !isWin32()) {
      await remove(join(newApp.getAppDir(), 'logs'));
    }
    if (MidwayFrameworkType.WEB === newApp.getFrameworkType()) {
      if (options.cleanTempDir !== false && !isWin32()) {
        await remove(join(newApp.getAppDir(), 'run'));
      }
    }
    if (options.sleep > 0) {
      await sleep(options.sleep);
    }
  }
}

export async function createFunctionApp<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions'],
  Y = ReturnType<T['getApplication']>
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions
): Promise<Y> {
  const framework: T = await create<T, U>(
    baseDir,
    options,
    '@midwayjs/serverless-app'
  );
  return (framework.getApplication() as unknown) as Y;
}

class BootstrapAppStarter {
  getApp(type: MidwayFrameworkType): IMidwayApplication<any> {
    const appMap = Bootstrap.starter.getBootstrapAppMap();
    return appMap.get(type);
  }

  async close(options:{
    sleep?: number;
  } = {}) {
    await Bootstrap.stop();
    if (options.sleep > 0) {
      await sleep(options.sleep);
    }
  }
}

export async function createBootstrap(
  entryFile: string
): Promise<BootstrapAppStarter> {
  await create(undefined, {
    entryFile,
  });
  return new BootstrapAppStarter();
}
