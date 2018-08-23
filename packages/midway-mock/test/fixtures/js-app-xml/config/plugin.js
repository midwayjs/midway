'use strict';
const path = require('path');

module.exports = {
  /**
   * 支持各个 bu 的健康检查
   */
  plugin2: {
    enable: true,
    path: path.join(__dirname, '../plugins/plugin2'),
  }
}