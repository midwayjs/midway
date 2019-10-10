import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolve module's full path
 * @param {string} moduleName module name
 * @return {string} full path or blank
 */
export function resolveModule(moduleName: string): string {
  if (!moduleName) {
    console.log('[midway-bin] value of framework/module to be loaded is blank and skipped.');
    return '';
  }

  const moduleFullPath = retrieveModulePath(moduleName);
  if (moduleFullPath) {
    return moduleFullPath;
  }
  console.log(`[midway-bin] Not found framework/module ${moduleName} and skip.`);
  return '';
}

/**
 * Retrieve correct module path
 * @param {string} moduleName module name
 * @return {string} path
 */
function retrieveModulePath(moduleName: string): string {
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

