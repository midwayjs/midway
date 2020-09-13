import { BootstrapStarter } from '@midwayjs/bootstrap';
import { IMidwayApplication, IMidwayFramework, MidwayFrameworkType } from '@midwayjs/core';
import { isAbsolute, join } from 'path';
import { remove } from 'fs-extra';
import { clearAllModule } from '@midwayjs/decorator';
import * as request from 'supertest';

process.setMaxListeners(0);

const appMap = new WeakMap();

function getIncludeFramework(dependencies): MidwayFrameworkType {
  for (const name of Object.keys(dependencies)) {
    if (name in MidwayFrameworkType) {
      return MidwayFrameworkType[name];
    }
  }
}

export async function create<T extends IMidwayFramework<U>, U = T['configurationOptions']>(baseDir: string = process.cwd(), options?: U, customFrameworkName?: string | MidwayFrameworkType | object): Promise<T> {
  clearAllModule();
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
    DefaultFramework = customFrameworkName;
  }

  // got options from framework
  if (DefaultFramework) {
    framework = new DefaultFramework();
    if (framework.getFrameworkType() === MidwayFrameworkType.WEB) {
      // add egg-mock plugin for @midwayjs/web test, provide mock method
      options = Object.assign(options, {
        plugins: {
          'egg-mock': {
            enable: true,
            package: 'egg-mock'
          },
          watcher: false,
          development: false,
        }
      });
    }
    framework.configure(options);
  } else {
    throw new Error('framework not found');
  }

  const starter = new BootstrapStarter();

  if (!isAbsolute(baseDir)) {
    baseDir = join(process.cwd(), 'test', 'fixtures', baseDir);
  }

  starter
    .configure({
      baseDir
    })
    .load(framework);

  await starter.init();
  await starter.run();

  appMap.set(framework.getApplication(), starter);

  return framework;
}

export async function createApp<T extends IMidwayFramework<U>, U = T['configurationOptions'], Y = ReturnType<T['getApplication']>>(baseDir: string = process.cwd(), options?: U, customFrameworkName?: string | MidwayFrameworkType | object): Promise<Y> {
  const framework: T = await create<T, U>(baseDir, options, customFrameworkName);
  return framework.getApplication() as unknown as Y;
}

export async function close(app: IMidwayApplication | IMidwayFramework<any>) {
  if (!app) return;
  let newApp: IMidwayApplication;
  if ((app as IMidwayFramework<any>).getApplication) {
    newApp = (app as IMidwayFramework<any>).getApplication();
  } else {
    newApp = app as IMidwayApplication;
  }
  const starter = appMap.get(newApp);
  if (starter) {
    await starter.stop();
    appMap.delete(starter);
  }

  if (MidwayFrameworkType.WEB === newApp.getFrameworkType()) {
    await remove(join(newApp.getAppDir(), 'logs'));
    await remove(join(newApp.getAppDir(), 'run'));
  }
}

export function createHttpRequest(app: IMidwayApplication) {
  if ((app as any).callback) {
    return request((app as any).callback());
  } else {
    return request(app);
  }
}
