/**
 * Midway 服务器入口文件
 * @exports midway/server
 * @example
 * require('midway/server')({port:6001, workers:1}).ready(() => {
 *   console.log('Server has start at 6001');
 * });
 *
 * @param options {Object} 启动参数
 * @param options.port {Number} 启动端口
 * @param options.baseDir {String} 应用根目录
 * @param options.workers {Number} 启动的 worker 数量, 本地默认是 1
 * @param callback {Function} 启动完成的回调
 */
const Master = require('./cluster/master');
const fs = require('fs');
const assert = require('assert');

module.exports = (options, callback) => {
  assert(options.baseDir, 'options.baseDir is required and should be set the root path of your app!');
  assert(fs.existsSync(options.baseDir), `baseDir ${options.baseDir} does not exist!`);
  new Master(options).ready(callback);
};
