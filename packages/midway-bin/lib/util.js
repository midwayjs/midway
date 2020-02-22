/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

/**
 * Resolve module's full path
 * @param {string} moduleName module name
 * @return {string} full path or blank
 */
function resolveModule(moduleName) {
  if (! moduleName) {
    console.log('[midway-bin] value of framework/module to be loaded is blank and skipped.');
    return '';
  }

  const moduleFullPath = retrieveModulePath(moduleName);
  if (moduleFullPath) {
    return moduleFullPath;
  }
  console.log(`[midway-bin] Not found framework or module "${moduleName}" and skip.`);
  return '';
}

/**
 * Retrieve correct module path
 * @param {string} moduleName module name
 * @return {string} path
 */
function retrieveModulePath(moduleName) {
  const paths = require.resolve.paths(moduleName);

  const moduleDir = paths.find((dir) => {
    const mpath = path.join(dir, moduleName);
    try {
      fs.accessSync(mpath, fs.constants.R_OK);
      const stats = fs.statSync(mpath);
      return stats && stats.isDirectory();
    // eslint-disable-next-line @typescript-eslint/indent, brace-style
    }
    catch (ex) {
      return false;
    }
  });

  return moduleDir ? path.join(moduleDir, moduleName) : '';
}

exports.resolveModule = resolveModule;
