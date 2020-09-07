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
export const RELEASE = 'WANDA';

/**
 * debug for vscode
 */
export function startCluster(options, callback) {
  new Master(options).ready(callback);
}

export { Application, Agent } from './application';
