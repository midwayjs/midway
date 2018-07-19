'use strict';

const Command = require('egg-init');

class MidwayInitCommand extends Command {

  /**
   * fetch boilerplate mapping from `egg-init-config`
   * @param {String} [pkgName] - config package name, default to `this.configName`
   * @return {Object} boilerplate config mapping, `{ simple: { "name": "simple", "package": "egg-boilerplate-simple", "description": "Simple egg app boilerplate" } }`
   */
  * fetchBoilerplateMapping(pkgName) {
    const pkgInfo = yield this.getPackageInfo(pkgName || this.configName, true);
    const mapping = pkgInfo.config.boilerplate;
    Object.keys(mapping).forEach(key => {
      const item = mapping[key];
      item.name = item.name || key;
      item.from = pkgInfo;
    });
    mapping.ioc = {
      package: 'midway-boilerplate-simple',
      description: 'Simple midway application boilerplate',
      name: 'midway IoC',
    };
    return mapping;
  }
}

module.exports = MidwayInitCommand;
