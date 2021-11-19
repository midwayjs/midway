import * as Web from '../src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';
import { existsSync, readFileSync } from 'fs';
import { remove } from 'fs-extra';

const logDir = join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

export async function creatApp(name, options = {}) {
  return createApp(join(__dirname, 'fixtures', name), Object.assign(options, {
    configurationModule: [Web]
  }), Web)
}

export async function closeApp(app, options?) {
  await close(app, options);
  if (process.env.EGG_HOME) {
    await remove(join(process.env.EGG_HOME, 'logs'));
  }
  if(app?.getAppDir()) {
    await remove(join(app?.getAppDir(), 'logs'));
    await remove(join(app?.getAppDir(), 'run'));
  }
}

export { createHttpRequest } from '@midwayjs/mock';

export function getFilepath(p) {
  return join(__dirname, join('fixtures', p));
}

export const sleep = async (timeout = 1000) => {
  return new Promise(resolve =>  {
    setTimeout(resolve, timeout);
  });
}

export const matchContentTimes = (p: string, matchString: string | RegExp) => {
  let content;
  if(existsSync(p)) {
    content = readFileSync(p, {
      encoding: 'utf8'
    });
  }

  if (content === null || content === undefined) {
    return 0;
  }

  if (typeof matchString === 'string') {
    matchString = new RegExp(matchString, 'g');
  }

  const result = content.match(matchString) || [];
  return result.length;
}
