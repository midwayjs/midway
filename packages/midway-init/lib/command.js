'use strict';

const Command = require('egg-init');
const path = require('path');
const fs = require('fs');
const templateDir = path.join(__dirname, '../boilerplate/');

class MidwayInitCommand extends Command {

  * fetchBoilerplateMapping(pkgName) {
    const mapping = yield super.fetchBoilerplateMapping(pkgName);
    return Object.assign(require('../boilerplate/boilerplate.json'), mapping);
  }

  * downloadBoilerplate(pkgName) {
    const p = path.join(templateDir, pkgName);
    if (fs.existsSync(p)) {
      return p;
    } else {
      return yield super.downloadBoilerplate(pkgName);
    }
  }
}

module.exports = MidwayInitCommand;
