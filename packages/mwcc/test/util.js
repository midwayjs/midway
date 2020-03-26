const childProcess = require('child_process');

module.exports = {rimraf}

function rimraf(dir) {
  if (typeof dir !== 'string') {
    throw new Error('rimraf expects a string at the first argument.');
  }
  childProcess.execSync(`rm -rf ${JSON.stringify(dir)}`);
}
