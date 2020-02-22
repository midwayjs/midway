/* eslint-disable no-shadow */
import * as fs from 'fs';
import * as path from 'path';

import { mm } from 'midway-mock';


const logDir = path.join(__dirname, '../logs');

process.setMaxListeners(0);

if (! fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function app(name, options) {
  options = formatOptions(name, options);
  // mm.consoleLevel(options.consoleLevel || 'NONE');
  const appInst: any = mm.app(options);
  appInst.close = () => {
    fs.rmdirSync(path.join(appInst.baseDir, 'run'));
    return appInst.close;
  };
  return appInst;
}

export function cluster(name, options) {
  options = formatOptions(name, options);
  return mm.cluster(options);
}

export function formatOptions(name, options = {}) {
  return Object.assign({}, {
    baseDir: name,
    framework: path.join(__dirname, '../src/midway.ts'),
    // 默认关闭覆盖率，太慢
    coverage: false,
    cache: false,
  }, options);
}
