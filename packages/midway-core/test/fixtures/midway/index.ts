import {Agent, Application} from 'egg';
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

class MidwayApplication extends (Application as {
  new(...x)
}) {

  get [Symbol.for('egg#loader')]() {
    return AppWorkerLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

  get applicationContext() {
    return this.loader.applicationContext;
  }
}

class MidwayAgent extends (Agent as {
  new(...x)
}) {

  get [Symbol.for('egg#loader')]() {
    return AgentWorkerLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

  get applicationContext() {
    return this.loader.applicationContext;
  }
}

export {
  MidwayApplication as Application,
  MidwayAgent as Agent,
};
