'use strict';
const fs = require('fs');
const path = require('path');


/**
 * Resolve mono-repo's full path
 * @param {string} module - module name
 * @return {string} full path or blank
 */
function findFramework(module) {
  let framePath = '';
  const modPath = resolveModule(module);

  if (modPath) {
    framePath = path.join(modPath, '../../');
  } else {
    console.log(`[midway-bin] Not found framework "${module}" and skip.`);
  }

  return framePath;
}


/**
 * Resolve module's full path
 * @param {string} moduleName module name
 * @return {string} full path or blank
 */
function resolveModule(moduleName) {
  if (!moduleName) {
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


exports.findFramework = findFramework;
exports.resolveModule = resolveModule;
