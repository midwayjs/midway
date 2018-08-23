const EggMaster = require('egg-cluster/lib/master');
const path = require('path');
const formatOptions = require('./utils').formatOptions;

class Master extends EggMaster {

  constructor(options) {
    options = formatOptions(options);
    super(options);
    this.log('[master] egg version %s, egg-core version %s',
      require('egg/package').version,
      require('egg-core/package').version);
  }

  getAgentWorkerFile() {
    return path.join(__dirname, 'agent_worker.js');
  }

  getAppWorkerFile() {
    return path.join(__dirname, 'app_worker.js');
  }

}

module.exports = Master;
