import { Serverless, Service, PluginManager } from './lib';
import { hackInit, hackRun } from './commonHack';

export default class MidwayServerless extends Serverless {

  service: any;
  providerName: string;
  classes: any;
  pluginManager: any;
  processedInput: any;

  constructor(props) {
    super(props);
    this.pluginManager = new MidwayPluginManager(this);
    this.classes.PluginManager = MidwayPluginManager;
    this.providerName = props.providerName;
    this.service = new MidwayService(this);

  }

  async init(...params) {
    await super.init(...params);
    await hackInit(this, this.processedInput.commands, this.processedInput.options);
  }

  async run(...params) {
    await super.run(...params);
    await hackRun(this, this.processedInput.commands, this.processedInput.options);
  }
}

class MidwayService extends Service {

  provider: any;

  constructor(props) {
    super(props);

    if (this.provider) {
      this.provider.name = props.providerName;
    }
  }
}

class MidwayPluginManager extends PluginManager {
  resolveServicePlugins: any;
  resolveEnterprisePlugin: any;
  addPlugin: any;
  asyncPluginInit: any;

  constructor(props) {
    super(props);
  }

  loadAllPlugins(servicePlugins) {
    [
      ...require('serverless/lib/plugins'),
      ...this.resolveServicePlugins(servicePlugins),
      this.resolveEnterprisePlugin(),
    ]
      .filter(Boolean)
      .forEach(Plugin => {
        if (Plugin.name === 'MidwayServerless') {
          return;
        }
        return this.addPlugin(Plugin);
      });
    return this.asyncPluginInit();
  }
}
