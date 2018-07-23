import {MidwayLoader} from './midwayLoader';

const path = require('path');
const APP_NAME = 'app';
const AGENT_NAME = 'agent';

function isPluginName(name) {
  return typeof name === 'string' && !/^_/.test(name);
}

export class AppWorkerLoader extends MidwayLoader {

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
    const self = this;
    const pluginContainerProps = Object.getOwnPropertyNames(this);
    this.app = new Proxy(this.app, {
      set(obj, prop, value) {
        if (!self.pluginLoaded && isPluginName(prop) && !(prop in pluginContainerProps)) {
          // save to context when called app.xxx = xxx
          // now we can get plugin from context
          self.pluginContext.registerObject(prop, value);
        }
        return Reflect.set(obj, prop, value);
      }
    });

    this.getLoadUnits()
      .forEach(unit => {
        // 兼容旧插件加载方式
        let ret = this.loadFile(this.resolveModule(path.join(unit.path, APP_NAME)));
        if (ret) {
          // midway 的插件会返回对象
          this.pluginContext.registerObject(unit.name, ret);
        }
      });

    // 插件加载完毕
    this.pluginLoaded = true;
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

  /**
   * Load agent.js, same as {@link EggLoader#loadCustomApp}
   */
  loadCustomAgent() {
    const self = this;
    const pluginContainerProps = Object.getOwnPropertyNames(this);
    this.app = new Proxy(this.app, {
      set(obj, prop, value) {
        if (!self.pluginLoaded && isPluginName(prop) && !(prop in pluginContainerProps)) {
          // save to context when called app.xxx = xxx
          // now we can get plugin from context
          self.pluginContext.registerObject(prop, value);
        }
        return Reflect.set(obj, prop, value);
      }
    });

    this.getLoadUnits()
      .forEach(unit => {
        // 兼容旧插件加载方式
        let ret = this.loadFile(this.resolveModule(path.join(unit.path, AGENT_NAME)));
        if (ret) {
          // midway 的插件会返回对象
          this.pluginContext.registerObject(unit.name, ret);
        }
      });

    // 插件加载完毕
    this.pluginLoaded = true;
  }

  load() {
    this.loadAgentExtend();
    this.loadCustomAgent();
    this.app.beforeStart(async () => {
      await this.refreshContext();
    });
  }

}
