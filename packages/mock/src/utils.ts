import { BootstrapStarter } from '@midwayjs/bootstrap';
import {
  clearContainerCache,
  IMidwayApplication,
  IMidwayFramework,
  MidwayFrameworkType,
  safeRequire,
} from '@midwayjs/core';
import { isAbsolute, join } from 'path';
import { remove } from 'fs-extra';
import { clearAllModule } from '@midwayjs/decorator';
import { existsSync } from 'fs';
import { clearAllLoggers } from '@midwayjs/logger';
import * as os from 'os';

process.setMaxListeners(0);

function isTestEnvironment() {
  const testEnv = ['test', 'unittest'];
  return testEnv.includes(process.env.MIDWAY_SERVER_ENV)
    || testEnv.includes(process.env.EGG_SERVER_ENV)
    || testEnv.includes(process.env.NODE_ENV);
}

function isWin32() {
  return os.platform() === 'win32';
}

const appMap = new WeakMap();

function getIncludeFramework(dependencies): string {
  const values: string[] = Object.values(MidwayFrameworkType);
  for (const name of Object.keys(dependencies)) {
    if (values.includes(name)) {
      return name;
    }
  }
}

export type MockAppConfigurationOptions = {
  cleanLogsDir?: boolean;
  cleanTempDir?: boolean;
};

export async function create<
  T extends IMidwayFramework<any, U>,
  U = T['configurationOptions']
>(
  baseDir: string = process.cwd(),
  options?: U & MockAppConfigurationOptions,
  customFrameworkName?: string | MidwayFrameworkType | object
): Promise<T> {
  process.env.MIDWAY_TS_MODE = 'true';
  clearAllModule();
  clearContainerCache();
  clearAllLoggers();
  safeRequire(`${baseDir}/src/interface`);

  let framework: T = null;
  let DefaultFramework = null;

  // find framework
  if (customFrameworkName) {
    if (typeof customFrameworkName === 'string') {
      DefaultFramework = require(customFrameworkName as string).Framework;
    } else {
      DefaultFramework = customFrameworkName;
    }
  } else {
    // find default framework from pkg
    const pkg = require(join(baseDir, 'package.json'));
    if (pkg.dependencies) {
      customFrameworkName = getIncludeFramework(pkg.dependencies);
    }
    DefaultFramework = require(customFrameworkName as string).Framework;
  }

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

  if (!isAbsolute(baseDir)) {
    baseDir = join(process.cwd(), 'test', 'fixtures', baseDir);
  }

  if (!existsSync(baseDir)) {
    throw new Error(`${baseDir} not found`);
  }

  starter
    .configure({
      baseDir,
    })
    .load(framework);

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
  customFrameworkName?: string | MidwayFrameworkType | object
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
  options?: any
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
    appMap.delete(starter);
  }

  if (isTestEnvironment()) {
    if (MidwayFrameworkType.WEB === newApp.getFrameworkType()) {
      // clean first
      if (options.cleanLogsDir !== false && !isWin32()) {
        await remove(join(newApp.getAppDir(), 'logs'));
      }
      if (options.cleanTempDir !== false && !isWin32()) {
        await remove(join(newApp.getAppDir(), 'run'));
      }
    }
  }
}
