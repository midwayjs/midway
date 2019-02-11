'use strict';

const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (appInfo) => {
  const exports = {};

  exports.rundir = path.join(appInfo.root, 'run');

  // 修改默认的日志名
  exports.logger = {
    appLogName: `midway-web.log`,
    coreLogName: 'midway-core.log',
    agentLogName: 'midway-agent.log',
  };

  exports.pluginOverwrite = false;

  exports.security = {
    csrf: {
      ignoreJSON: false,
    }
  };

  exports.container = {
    ignore: [
      '**/node_modules/**',
      '**/logs/**',
      '**/run/**',
      '**/public/**',
      '**/view/**',
      '**/views/**',
      '**/config/**'
    ]
  };

  let alinodeLogdir = path.join(appInfo.root, 'logs/alinode');
  // try to use NODE_LOG_DIR first
  if (process.env.NODE_LOG_DIR) {
    alinodeLogdir = process.env.NODE_LOG_DIR;
  }
  mkdirp.sync(alinodeLogdir);

  exports.alinode = {
    logdir: alinodeLogdir,
    error_log: [
      path.join(appInfo.root, `logs/${appInfo.pkg.name}/common-error.log`),
      path.join(appInfo.root, 'logs/stderr.log'),
    ],
    packages: [
      path.join(appInfo.appDir, 'package.json'),
    ]
  };

  return exports;
};
