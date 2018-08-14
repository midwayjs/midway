/**
 * Midway 服务器入口文件
 * @exports midway/server
 * @example
 * require('midway/server')({typescript:true, baseDir:__dirname}).ready(() => {
 *   console.log('Server has start at 6001');
 * });
 *
 * @param options {Object} 启动参数
 * @param options.typescript {boolean} 是否走ts模式
 * @param options.baseDir {String} 应用根目录
 * @param callback {Function} 启动完成的回调
 */
const Master = require('./cluster/master');
const path = require('path');
let options = {};
try {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const serverOpts = pkg['midway-server-options'];
  if(serverOpts) {
    if(typeof serverOpts === 'string') {
      options = require(path.join(process.cwd(), serverOpts));
    } else {
      options = serverOpts;
    }
  }
} catch (err) {
  console.error('[midway]: load server config error ', err);
}
new Master(options);
