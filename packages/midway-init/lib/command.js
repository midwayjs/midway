'use strict';

const Command = require('egg-init');
const path = require('path');
const fs = require('fs');
const Parser = require('./parser');
const templateDir = path.join(__dirname, '../boilerplate/');
const os = require('os');

class MidwayInitCommand extends Command {

  constructor(options = {}) {
    super(Object.assign({}, options));
  }

  * fetchBoilerplateMapping() {
    return require('../boilerplate/boilerplate.json');
  }

  * downloadBoilerplate(pkgName) {
    const p = path.join(templateDir, pkgName);
    if (fs.existsSync(p)) {
      return p;
    }
    return yield super.downloadBoilerplate(pkgName);
  }

  getParser() {
    return Parser.getParser();
  }

  getParserOptions() {
    return Parser.getParserOptions();
  }

  printUsage() {
    super.printUsage();
    if (os.platform() === 'win32') {
      this.log(`Since it is windows system, please review this note.
      https://midwayjs.org/midway/guide.html#%E5%90%AF%E5%8A%A8%E5%8F%82%E6%95%B0%E4%BC%A0%E9%80%92
      `);
    }
  }
}

module.exports = MidwayInitCommand;
