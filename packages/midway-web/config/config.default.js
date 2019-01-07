'use strict';

const path = require('path');

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

  exports.alinode = {
    logdir: path.join(appInfo.root, 'logs/alinode'),
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
