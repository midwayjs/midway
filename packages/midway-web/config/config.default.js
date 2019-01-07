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

  const appRoot = appInfo.env === 'local' || appInfo.env === 'unittest' ? appInfo.appDir : appInfo.HOME;
  exports.alinode = {
    logdir: path.join(appRoot, 'logs/alinode'),
    error_log: [
      path.join(appRoot, `logs/${appInfo.pkg.name}/common-error.log`),
      path.join(appRoot, 'logs/stderr.log'),
    ],
    packages: [
      path.join(appInfo.appDir, 'package.json'),
    ]
  };

  return exports;
};
