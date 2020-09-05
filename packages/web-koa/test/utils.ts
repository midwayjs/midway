import { BootstrapStarter } from '@midwayjs/bootstrap';
import { IMidwayWebConfigurationOptions, Framework } from '../src';
import { join } from 'path';
import { clearAllModule } from "@midwayjs/decorator";

const appMap = new WeakMap();

export async function creatApp(name, options: IMidwayWebConfigurationOptions = {}) {
  clearAllModule();
  const midwayWeb = new Framework().configure(options);
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
  }
}
