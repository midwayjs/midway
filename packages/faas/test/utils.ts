import { BootstrapStarter } from '@midwayjs/bootstrap';
import { IFaaSConfigurationOptions, Framework } from '../src';
import { join } from 'path';
import { clearAllModule } from "@midwayjs/decorator";

const appMap = new WeakMap();

export async function creatApp(name, options: Partial<IFaaSConfigurationOptions> = {}, Clz?): Promise<Framework> {
  const baseDir = join(__dirname, 'fixtures', name);
  clearAllModule();
  // clearBaseDirCache(baseDir);

  let framework;
  if (Clz) {
    framework = new Clz().configure(options);
  } else {
    framework = new Framework().configure(options);
  }
  const starter = new BootstrapStarter();

  starter
    .configure({
      baseDir,
    })
    .load(framework);

  await starter.init();
  await starter.run();

  appMap.set(framework, starter);

  return framework;
}

export async function closeApp(framework) {
  if (!framework) return;
  const starter = appMap.get(framework);
  if (starter) {
    await starter.stop();
    appMap.delete(framework);
  }
}
