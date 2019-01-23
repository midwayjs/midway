export * from 'injection';
export * from 'midway-core';
export * from 'midway-web';
export {
  Context,
  IContextLocals,
  EggEnvType,
  IEggPluginItem,
  EggPlugin,
  PowerPartial,
  EggAppConfig,
  FileStream,
  IApplicationLocals,
  EggApplication,
  EggAppInfo,
  EggHttpClient,
  EggContextHttpClient,
  Request,
  Response,
  ContextView,
  LoggerLevel,
  Router,
} from 'egg';
const Master = require('../cluster/master');

/**
 * current version of midway
 * @member {String} Midway#VERSION
 */
export const VERSION = require('../package.json').version;

/**
 * current release name
 * @member {String} Midway#RELEASE
 */
export const RELEASE = 'VISION';

/**
 * debug for vscode
 */
export function startCluster(options, callback) {
  new Master(options).ready(callback);
}
