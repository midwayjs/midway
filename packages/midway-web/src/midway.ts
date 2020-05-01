import { Agent, Application } from 'egg';
import { Logger } from 'egg-logger';
import { AgentWorkerLoader, AppWorkerLoader } from './loader/loader';
import * as fs from 'fs';
import * as path from 'path';
import { EggRouter as Router } from '@eggjs/router';
import { IMidwayCoreApplication, MidwayProcessTypeEnum } from '@midwayjs/core';

const MIDWAY_PATH = path.dirname(__dirname);

class MidwayApplication
  extends (Application as {
    new (...x);
  })
  implements IMidwayCoreApplication {
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
    return (this.loader as AppWorkerLoader).generateController(
      controllerMapping
    );
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
    const rundir = this.config.rundir;
    try {
      const tree = this.loader.dumpDependency();
      const dumpFile = path.join(
        rundir,
        `${this.type}_dependency_${process.pid}`
      );
      fs.writeFileSync(dumpFile, tree);
    } catch (err) {
      this.coreLogger.warn(`dump dependency dot error: ${err.message}`);
    }

    // dump routers to router.json
    try {
      const dumpRouterFile = path.join(rundir, 'midway-router.json');
      const routers = [];
      for (const router of this.loader.prioritySortRouters) {
        for (const layer of router['router'].stack) {
          routers.push({
            name: layer.name,
            methods: layer.methods,
            paramNames: layer.paramNames,
            path: layer.path,
            regexp: layer.regexp.toString(),
            stack: layer.stack.map(
              stack => stack._name || stack.name || 'anonymous'
            ),
          });
        }
      }

      fs.writeFileSync(dumpRouterFile, JSON.stringify(routers, null, 2));
    } catch (err) {
      this.coreLogger.warn(
        `dumpConfig midway-router.json error: ${err.message}`
      );
    }
  }

  getBaseDir(): string {
    return this.baseDir;
  }
  getAppDir(): string {
    return this.appDir;
  }
  getEnv(): string {
    return this.config.env;
  }
  getMidwayType(): string {
    return 'MIDWAY_EGG';
  }
  getProcessType(): MidwayProcessTypeEnum {
    return MidwayProcessTypeEnum.APPLICATION;
  }
}

class MidwayAgent
  extends (Agent as {
    new (...x);
  })
  implements IMidwayCoreApplication {
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
      const tree = this.loader.dumpDependency();
      const rundir = this.config.rundir;
      const dumpFile = path.join(
        rundir,
        `${this.type}_dependency_${process.pid}`
      );
      fs.writeFileSync(dumpFile, tree);
    } catch (err) {
      this.coreLogger.warn(`dump dependency dot error: ${err.message}`);
    }
  }

  getBaseDir(): string {
    return this.baseDir;
  }
  getAppDir(): string {
    return this.appDir;
  }
  getEnv(): string {
    return this.config.env;
  }
  getMidwayType(): string {
    return 'MIDWAY_EGG';
  }
  getProcessType(): MidwayProcessTypeEnum {
    return MidwayProcessTypeEnum.AGENT;
  }
}

export { MidwayApplication as Application, MidwayAgent as Agent };
