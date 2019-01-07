import {MidwayWebLoader} from './webLoader';

const APP_NAME = 'app';
const AGENT_NAME = 'agent';

export class AppWorkerLoader extends MidwayWebLoader {

  /**
   * load app.js
   *
   * @example
   * ```js
   * module.exports = function(app) {
   *   // can do everything
   *   do();
   *
   *   // if you will invoke asynchronous, you can use readyCallback
   *   const done = app.readyCallback();
   *   doAsync(done);
   * }
   * ```
   * @since 1.0.0
   */
  loadCustomApp() {
    this.interceptLoadCustomApplication(APP_NAME);
  }

  /**
   * Load all directories in convention
   * @since 1.0.0
   */
  load() {
    // app > plugin > core
    this.loadApplicationExtend();
    this.loadRequestExtend();
    this.loadResponseExtend();
    this.loadContextExtend();
    this.loadHelperExtend();

    this.loadApplicationContext();
    // app > plugin
    this.loadCustomApp();
    // app > plugin
    this.loadService();
    // app > plugin > core
    this.loadMiddleware();

    this.app.beforeStart(async () => {
      await this.refreshContext();
      // get controller
      await this.loadController();
      // app
      this.loadRouter(); // 依赖 controller
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
    this.loadAgentExtend();
    this.loadApplicationContext();
    this.loadCustomAgent();
    this.app.beforeStart(async () => {
      await this.refreshContext();
    });
  }

}
