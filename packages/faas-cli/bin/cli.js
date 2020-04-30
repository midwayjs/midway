'use strict';
const { debugWrapper } = require('@midwayjs/debugger');
const cliFun = async argv => {
  require('source-map-support/register');
  const { CLI } = require('../dist');
  const cli = new CLI(argv);
  cli.start().then(() => {
    process.exit();
  }).catch(e => {
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
