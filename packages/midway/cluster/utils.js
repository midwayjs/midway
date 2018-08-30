'use strict';

const path = require('path');

/**
 * register ts env
 * @param {Object} options {env: NODE_ENV, typescript: true}
 */
exports.registerTypescriptEnvironment = options => {
  let tsFlag = options.typescript;
  // 只有是 ts 应用，并且在本地环境才判断是否加载 ts-node
  if (tsFlag && !exports.isTypeScriptEnvironment() && exports.isDev()) {
    try {
      require('ts-node/register');
    } catch (e) {
      throw new Error('Need ts-node(https://github.com/TypeStrong/ts-node) be installed!');
    }
  }
};

exports.isDev = env => {
  return ['unittest', 'local'].includes(env || process.env.NODE_ENV);
};

exports.isTypeScriptEnvironment = () => {
  return !!require.extensions['.ts'];
};

/**
 * add typescript and baseDir
 * @param options
 * @returns {*}
 */
exports.formatOptions = (options) => {
  options.framework = 'midway';
  if(!options.baseDir) {
    options.baseDir = process.cwd();
  }

  if(options.typescript === undefined) {
    if(exports.isTypeScriptEnvironment()) {
      options.typescript = true;
    } else {
      const pkg = require(path.join(options.baseDir, 'package.json'));
      if(pkg['dependencies'] && pkg['dependencies']['typescript']) {
        options.typescript = true;
      }
      if(pkg['devDependencies'] && pkg['devDependencies']['typescript']) {
        options.typescript = true;
      }
    }
  }

  return options;
};
