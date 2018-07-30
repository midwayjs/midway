const EggMaster = require('egg-cluster/lib/master');
const path = require('path');
const isTypeScriptEnvironment = require('./utils').isTypeScriptEnvironment;

class Master extends EggMaster {

  constructor(options) {
    if(isTypeScriptEnvironment()) {
      options.isTsEnv = true;
    }

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
