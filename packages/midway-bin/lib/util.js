'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Resolve module's full path
 * @param {string} moduleName module name
 * @return {string} full path
 */
function resolveModule(moduleName) {
  if (!moduleName) {
    console.log('[midway-bin] value of framework is blank and skipped.');
    return;
  }

  try {
    const moduleFullPath = retrieveModulePath(moduleName);
    return moduleFullPath;
  } catch (err) {
    console.log(`[midway-bin] Not found framework ${moduleName} and skip.`);
  }
}

/**
 * Retrieve correct module path
 * @param {string} moduleName module name
 * @return {string} path
 */
function retrieveModulePath(moduleName) {
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

exports.resolveModule = resolveModule;
