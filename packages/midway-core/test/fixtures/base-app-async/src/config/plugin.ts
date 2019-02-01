const path = require('path');

module.exports = {
  // 默认开启的插件

  /**
   * 支持各个 bu 的健康检查
   */
  plugin2: {
    enable: true,
    path: path.join(__dirname, '../plugins/plugin2'),
  }
};
