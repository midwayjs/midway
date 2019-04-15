const EggMaster = require('egg-cluster/lib/master');
const formatOptions = require('./utils').formatOptions;

class Master extends EggMaster {

  constructor(options) {
    options = formatOptions(options);
    super(options);
    this.log('[master] egg version %s, egg-core version %s',
      require('egg/package').version,
      require('egg-core/package').version);
  }

}

module.exports = Master;
