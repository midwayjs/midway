'use strict';

const Command = require('egg-bin').Command;
const rimraf = require('mz-modules/rimraf');
const path = require('path');
const fseExtra = require('fs-extra');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin clean';
  }

  get description() {
    return 'clean application temporary files';
  }

  async run(context) {
    const { cwd } = context;
    if (!fseExtra.existsSync(path.join(cwd, 'package.json'))) {
      console.log(`[midway-bin] package.json not found in ${cwd}\n`);
      return;
    }
    await this.cleanDir(cwd);
  }

  async cleanDir(cwd) {
    await new Promise((resolve, reject) => {
      const rmDirName = ['logs', 'run', '.nodejs-cache'];
      try {
        rmDirName.forEach(name => {
          fseExtra.removeSync(path.join(cwd, name));
        });
        console.log('[midway-bin] clean midway temporary files complete!');
        resolve();
      } catch (error) {
        console.error(`[midway-bin] exec error: ${error}`);
        reject(error);
        return;
      }
    });

    const pkg = require(path.join(cwd, 'package.json'));
    if (pkg['midway-bin-clean'] && pkg['midway-bin-clean'].length) {
      for (const file of pkg['midway-bin-clean']) {
        await rimraf(path.join(cwd, file));
        console.log(`[midway-bin] clean ${file} success!`);
      }
      console.log('[midway-bin] clean complete!');
    }
  }
}

module.exports = CleanCommand;
