import { MidwayWebLoader } from './webLoader';

const APP_NAME = 'app';
const AGENT_NAME = 'agent';

export class AppWorkerLoader extends MidwayWebLoader {
  loadCustomApp() {
    this.interceptLoadCustomApplication(APP_NAME);
  }

  /**
   * Load all directories in convention
   * @since 1.0.0
   */
  load() {
    this.loadApplicationContext();
    this.loadCustomApp();
    super.load();

    this.app.beforeStart(async () => {
      await this.refreshContext();
      await this.loadMidwayController();
    });
  }

}

export class AgentWorkerLoader extends MidwayWebLoader {

  /**
   * Load agent.js, same as {@link EggLoader#loadCustomApp}
   */
  loadCustomAgent() {
    this.interceptLoadCustomApplication(AGENT_NAME);
  }

  load() {
    this.loadApplicationContext();
    this.loadCustomAgent();
    super.load();
    this.app.beforeStart(async () => {
      await this.refreshContext();
    });
  }

}
