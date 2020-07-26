'use strict';
const { debugWrapper } = require('@midwayjs/debugger');
const { existsSync, remove } = require('fs-extra');
const { resolve } = require('path');
const cliFun = async argv => {
  require('source-map-support/register');
  const { CLI } = require('../dist');
  const buildDirectionPath = resolve(process.cwd(), '.faas_debug_tmp');
  if (existsSync(buildDirectionPath)) {
    await remove(buildDirectionPath);
  }

  const cli = new CLI(argv);
  cli
    .start()
    .then(() => {
      process.exit();
    })
    .catch(() => {
      process.exit();
    });
};

const cli = argv => {
  const isDebug = argv.debug;
  delete argv.debug;
  debugWrapper({
    file: __filename, // 要包裹的方法所在文件
    export: 'cliFun', // 要包裹的方法的方法名
    debug: isDebug,
  })(argv);
};

module.exports = {
  cliFun,
  cli,
};
