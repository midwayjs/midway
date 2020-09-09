#!/usr/bin/env node

'use strict';
const { debugWrapper } = require('@midwayjs/debugger');
const cliFun = async argv => {
  require('source-map-support/register');
  const { CLI } = require('../dist');
  const cli = new CLI(argv);
  cli
    .start()
    .then(() => {
      process.exit();
    })
    .catch(() => {
      process.exitCode = 1;
      process.exit(1);
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
