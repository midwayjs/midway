export * from 'midway-context';
export * from 'midway-web';
import {Application, Agent} from 'midway-web';
import {ApplicationContext} from 'midway-context';
let app, agent = null;

/**
 * 当前的 Midway 版本
 * @member {String} Midway#VERSION
 */
export const VERSION = require('../package.json').version;

/**
 * 当前版本代号
 * @member {String} Midway#RELEASE
 */
export const RELEASE = 'VISION';

/**
 * 获取一个Application实例
 *
 * @deprecated
 * @method Midway#getApp
 * @returns {Application} 应用实例
 */
export function getApp(options) {
  app = new Application(options);
  return app;
}

/**
 * 获取一个Agent实例
 *
 * @deprecated
 * @method Midway#getAgent
 * @returns {Agent} Agent实例
 */
export function getAgent(options) {
  agent = new Agent(options);
  return agent;
}

export function getApplicationContext(): ApplicationContext {
  if(app) {
    return app.loader.getApplicationContext();
  } else if(agent) {
    return agent.loader.getApplicationContext();
  }
}

export function getPluginContext(): ApplicationContext {
  if(app) {
    return app.loader.getPluginContext();
  } else if(agent) {
    return agent.loader.getPluginContext();
  }
}

/**
 * 获取一个插件实例
 *
 * @deprecated
 * @method Midway#getPlugin
 * @param {String} pluginName
 * @returns {Plugin} 插件实例
 */
export function getPlugin(pluginName): any {
  return getPluginContext().get(pluginName);
}

/**
 * 获取配置
 *
 * @deprecated
 * @method Midway#getConfig
 * @returns {Object} 配置对象
 */
export function getConfig(configKey): any {
  if(configKey) {
    return app.config[configKey];
  }
  return app.config;
}

/**
 * 获取日志实例
 *
 * @deprecated
 * @method Midway#getLogger
 * @param {String} loggerName
 * @returns {Logger} 日志实例
 */
export function getLogger(loggerName: string): any {
  if(loggerName) {
    return app.loggers[loggerName];
  }
  return app.loggers;
}
