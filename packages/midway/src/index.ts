import Master from '../cluster/master'


export * from 'midway-web'

/**
 * current version of midway
 * @member {String} Midway#VERSION
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const VERSION = require('../package.json').version

/**
 * current release name
 * @member {String} Midway#RELEASE
 */
export const RELEASE = 'VISION'

/**
 * debug for vscode
 */
export function startCluster(options, callback) {
  new Master(options).ready(callback)
}
