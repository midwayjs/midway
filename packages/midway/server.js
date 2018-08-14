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

module.exports = (options, callback) => {
  new Master(options).ready(callback);
};
