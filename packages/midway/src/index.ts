export * from 'injection';
export * from 'midway-core';
export * from 'midway-web';
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
