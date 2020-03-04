import * as fs from 'fs';
import * as path from 'path';

import { Agent, Application } from 'egg';
import { Logger } from 'egg-logger';
import { EggRouter as Router } from '@eggjs/router';

import { AgentWorkerLoader, AppWorkerLoader } from './loader/loader';


const MIDWAY_PATH = path.dirname(__dirname);

// eslint-disable-next-line @typescript-eslint/no-extra-parens
class MidwayApplication extends (Application as {
  new(...x);
}) {

  Router = Router;

  get [Symbol.for('egg#loader')]() {
    return AppWorkerLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return MIDWAY_PATH;
  }

  getConfig(key?) {
    return key ? this.config[key] : this.config;
  }

  get enablePlugins() {
    return this.plugins;
  }

  getLogger(name?) {
    return name ? this.loggers[name] : this.logger;
  }

  getPlugin(pluginName) {
    return this.getPluginContext().get(pluginName);
  }

  getPluginContext() {
    return (this.loader as AppWorkerLoader).pluginContext;
  }

  getApplicationContext() {
    return (this.loader as AppWorkerLoader).applicationContext;
  }

  generateController(controllerMapping: string) {
    return (this.loader as AppWorkerLoader).generateController(controllerMapping);
  }

  /**
   * The current code base directory of application
   * in typescript mode is include src
   * @member {String}
   */
  get baseDir(): string {
    return this.loader.baseDir;
  }

  /**
   * The current directory of application
   * @member {String}
   */
  get appDir(): string {
    return this.loader.appDir;
  }

  /**
   * get application context
   */
  get applicationContext() {
    return this.loader.applicationContext;
  }

  /**
   * get plugin context
   */
  get pluginContext() {
    return this.loader.pluginContext;
  }

  dumpConfig() {
    super.dumpConfig();
    try {
      const tree = this.applicationContext.dumpDependency();
      const rundir = this.config.rundir;
      const dumpFile = path.join(rundir, `${this.type}_dependency_${process.pid}`);
      fs.writeFileSync(dumpFile, tree);
    }
    catch (err) {
      this.coreLogger.warn(`dump dependency dot error: ${err.message}`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-extra-parens
class MidwayAgent extends (Agent as {
  new(...x);
}) {

  get [Symbol.for('egg#loader')]() {
    return AgentWorkerLoader;
  }

  get [Symbol.for('egg#eggPath')]() {
    return MIDWAY_PATH;
  }

  getConfig(key?) {
    return key ? this.config[key] : this.config;
  }

  getLogger(name?): Logger {
    return name ? this.loggers[name] : this.logger;
  }

  getPlugin(pluginName) {
    return this.getPluginContext().get(pluginName);
  }

  getPluginContext() {
    return (this.loader as AgentWorkerLoader).pluginContext;
  }

  getApplicationContext() {
    return (this.loader as AgentWorkerLoader).applicationContext;
  }

  /**
   * The current code base directory of application
   * in typescript mode is include src
   * @member {String}
   */
  get baseDir(): string {
    return this.loader.baseDir;
  }

  /**
   * The current directory of application
   * @member {String}
   */
  get appDir(): string {
    return this.loader.appDir;
  }

  /**
   * get application context
   */
  get applicationContext() {
    return this.loader.applicationContext;
  }

  /**
   * get plugin context
   */
  get pluginContext() {
    return this.loader.pluginContext;
  }

  dumpConfig() {
    super.dumpConfig();
    try {
      const tree = this.applicationContext.dumpDependency();
      const rundir = this.config.rundir;
      const dumpFile = path.join(rundir, `${this.type}_dependency_${process.pid}`);
      fs.writeFileSync(dumpFile, tree);
    }
    catch (err) {
      this.coreLogger.warn(`dump dependency dot error: ${err.message}`);
    }
  }
}

export {
  MidwayApplication as Application,
  MidwayAgent as Agent,
};
