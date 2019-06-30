'use strict';

const path = require('path');
const accessSync = require('fs').accessSync;

exports.isTypeScriptEnvironment = () => {
  return !!require.extensions['.ts'];
};

/**
 * add typescript and baseDir
 * @param options
 * @returns {*}
 */
exports.formatOptions = (options) => {
  options.framework = options.framework || 'midway';
  if(!options.baseDir) {
    options.baseDir = process.cwd();
  }

  if(typeof options.typescript === 'undefined') {
    /* istanbul ignore else*/
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

    /* istanbul ignore else*/
    if (! options.typescript) {
      try {
        accessSync(path.join(options.baseDir, 'tsconfig.json'));
        options.typescript = true;
      } catch (ex) { }
    }

  }

  return options;
};
