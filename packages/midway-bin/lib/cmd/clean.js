'use strict';

const Command = require('egg-bin').Command;
const rimraf = require('mz-modules/rimraf');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin clean';
  }

  get description() {
    return 'clean application temporary files';
  }

  * run(context) {
    const { cwd } = context;
    if (!fs.existsSync(path.join(cwd, 'package.json'))) {
      console.log(`[midway-bin] package.json not found in ${cwd}\n`);
      return;
    }
    yield this.cleanDir(cwd);
  }

  * cleanDir(cwd) {
    yield new Promise((resolve, reject) => {
      cp.exec('find . -type d -name \'logs\' -or -name \'run\' -or -name \'.nodejs-cache\' | xargs rm -rf', {
        cwd,
      }, error => {
        if (error) {
          console.error(`[midway-bin] exec error: ${error}`);
          reject();
          return;
        }
        console.log('[midway-bin] clean midway temporary files complete!');
        resolve();
      });
    });

    const pkg = require(path.join(cwd, 'package.json'));
    if (pkg['midway-bin-clean'] && pkg['midway-bin-clean'].length) {
      for (const file of pkg['midway-bin-clean']) {
        yield rimraf(path.join(cwd, file));
        console.log(`[midway-bin] clean ${file} success!`);
      }
      console.log('[midway-bin] clean complete!');
    }
  }
}

module.exports = CleanCommand;
