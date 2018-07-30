'use strict';

const Command = require('egg-init');
const path = require('path');
const fs = require('fs');
const Parser = require('./parser');
const templateDir = path.join(__dirname, '../boilerplate/');

class MidwayInitCommand extends Command {

  constructor(options = {}) {
    super(Object.assign({}, options));
  }

  * fetchBoilerplateMapping(pkgName) {
    const mapping = yield super.fetchBoilerplateMapping(pkgName);
    return Object.assign(require('../boilerplate/boilerplate.json'), mapping);
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
}

module.exports = MidwayInitCommand;
