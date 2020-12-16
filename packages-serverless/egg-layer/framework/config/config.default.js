const os = require('os');
exports.logger = {
  dir: os.tmpdir(),
  disableConsoleAfterReady: false,
};

exports.rundir = os.tmpdir();

exports.static = {
  buffer: true,
};
