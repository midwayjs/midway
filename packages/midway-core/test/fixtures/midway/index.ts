import {Agent, Application, Logger} from 'egg';
import {MidwayLoader} from '../../../src';

export class AppWorkerLoader extends MidwayLoader {

  loadCustomApp() {
    this.interceptLoadCustomApplication('app');
  }

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
      // get and ready
      await this.preloadController();
      // app
      this.loadController();
      // app
      this.loadRouter(); // 依赖 controller
    });
  }

}

export class AgentWorkerLoader extends MidwayLoader {

  loadCustomAgent() {
    this.interceptLoadCustomApplication('agent');
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

class MidwayApplication extends (<{
  new(...x)
}> Application) {

  get [Symbol.for('egg#loader')]() {
    return AppWorkerLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }
}

class MidwayAgent extends (<{
  new(...x)
}> Agent) {

  get [Symbol.for('egg#loader')]() {
    return AgentWorkerLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

}

export {
  MidwayApplication as Application,
  MidwayAgent as Agent,
};
