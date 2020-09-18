'use strict';

exports.isTypeScriptEnvironment = () => {
  // eslint-disable-next-line node/no-deprecated-api
  return !!require.extensions['.ts'];
};

/**
 * add typescript and baseDir
 * @param options
 * @returns {*}
 */
exports.formatOptions = options => {
  options.framework = options.framework || 'midway';
  if (!options.baseDir) {
    options.baseDir = process.cwd();
  }

  if (typeof options.typescript === 'undefined') {
    options.typescript = true;
  }

  return options;
};
