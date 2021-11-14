exports.watcher = {
  // watcher 在 prod 中默认没有设置 type，防止框架开发者忘记设置，这里设置一下，避免报错
  type: 'development',
};

exports.midwayLogger = {
  default: {
    level: 'debug',
    consoleLevel: 'info'
  }
};

exports.keys = 'foo';
