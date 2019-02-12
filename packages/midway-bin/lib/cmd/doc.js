'use strict';

const Command = require('egg-bin').Command;
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

class DocCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin doc';
  }

  get description() {
    return 'generate typescript document';
  }

  * run(context) {
    const { cwd } = context;
    if (!fs.existsSync(path.join(cwd, 'package.json'))) {
      console.log(`[midway-bin] package.json not found in ${cwd}\n`);
      return;
    }
    yield this.cleanDir(cwd);
  }
}

module.exports = DocCommand;
