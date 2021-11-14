const os = require('os');

exports.midwayLogger = {
  default: {
    dir: os.tmpdir(),
    disableFile: true,
    disableError: true,
  },
};

exports.egg = {
  dumpConfig: false,
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
