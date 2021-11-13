const os = require('os');

exports.midwayLogger = {
  default: {
    dir: os.tmpdir(),
  },
};

exports.logger = {
  dir: os.tmpdir(),
  disableConsoleAfterReady: false,
};

exports.rundir = os.tmpdir();

exports.static = {
  buffer: true,
};

exports.proxy = true;
