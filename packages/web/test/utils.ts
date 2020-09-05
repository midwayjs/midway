import { BootstrapStarter } from '@midwayjs/bootstrap';
import { IMidwayWebConfigurationOptions, MidwayWebFramework } from '../src';
import { join } from 'path';
import { remove } from 'fs-extra';
import { clearAllModule } from "@midwayjs/decorator";

const logDir = join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

process.setMaxListeners(0);

const appMap = new WeakMap();

export async function creatApp(name, options: IMidwayWebConfigurationOptions = {}) {
  clearAllModule();
  const newOptions = Object.assign(options, {
    plugins: {
      'egg-mock': {
        enable: true,
        package: 'egg-mock'
      }
    }
  });
  const midwayWeb = new MidwayWebFramework().configure(newOptions);
  const starter = new BootstrapStarter();

  starter
    .configure({
      baseDir: join(__dirname, 'fixtures', name),
    })
    .load(midwayWeb);

  await starter.init();
  await starter.run();

  appMap.set(midwayWeb.getApplication(), starter);

  return midwayWeb.getApplication();
}

export async function closeApp(app) {
  if (!app) return;
  const starter = appMap.get(app);
  if (starter) {
    await starter.stop();
    appMap.delete(starter);
  }

  await remove(join(app.getAppDir(), 'logs'));
  await remove(join(app.getAppDir(), 'run'));
}
