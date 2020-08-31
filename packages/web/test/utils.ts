import { Bootstrap } from '@midwayjs/bootstrap';
import { MidwayWebFramework } from '../src';
import { join } from 'path';

const logDir = join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

process.setMaxListeners(0);

export async function creatApp(name, options?) {
  const midwayWeb = new MidwayWebFramework().configure(options);
  await Bootstrap.configure({
    baseDir: join(__dirname, 'fixtures', name),
  })
    .load(midwayWeb)
    .run();

  return midwayWeb.getApplication();
}
