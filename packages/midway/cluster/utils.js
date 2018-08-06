'use strict';
/**
 * 判断是否为本地测试或者开发环境，ugly...
 * @param {Object} options {env: NODE_ENV, typescript: true}
 * @return {Boolean} true or false
 */
exports.isNeedCompile = options => {
  let need = options.typescript && options.isTsEnv;
  if (need && !exports.isTypeScriptEnvironment()) {
    try {
      require('ts-node/register');
    } catch (e) {
      throw new Error('Need ts-node(https://github.com/TypeStrong/ts-node) be installed!');
    }
  }

  return need;
};

exports.isDev = env => {
  return ['unittest', 'local'].includes(env || process.env.NODE_ENV);
};

exports.isTypeScriptEnvironment = () => {
  return !!require.extensions['.ts'];
};
