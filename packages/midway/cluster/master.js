const EggMaster = require('egg-cluster/lib/master');
const formatOptions = require('./utils').formatOptions;

class Master extends EggMaster {

  constructor(options) {
    super(formatOptions(options));
  }

}

module.exports = Master;
