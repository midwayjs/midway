'use strict';

const fs = require('fs');
const path = require('path');
import { mm } from 'midway-mock';

const logDir = path.join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

process.setMaxListeners(0);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function app(name, options) {
  options = formatOptions(name, options);
  // mm.consoleLevel(options.consoleLevel || 'NONE');
  const app: any = mm.app(options);
  app.close = () => {
    fs.rmdirSync(path.join(app.baseDir, 'run'));
    return app.close;
  };
  return app;
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
