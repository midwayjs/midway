import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolve module's full path
 * @param {string} moduleName module name
 * @return {string} full path or blank
 */
export function resolveModule(moduleName) {
  if (!moduleName) {
    return '';
  }

  const moduleFullPath = retrieveModulePath(moduleName);
  if (moduleFullPath) {
    return moduleFullPath;
  }
  return '';
}

/**
 * Retrieve correct module path
 * @param {string} moduleName module name
 * @return {string} path
 */
export function retrieveModulePath(moduleName) {
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const paths = require.resolve.paths(moduleName);

  const moduleDir = paths.find(dir => {
    const mpath = path.join(dir, moduleName);
    try {
      fs.accessSync(mpath, fs.constants.R_OK);
      const stats = fs.statSync(mpath);
      return stats && stats.isDirectory();
    } catch (ex) {
      return false;
    }
  });

  return moduleDir ? path.join(moduleDir, moduleName) : '';
}
