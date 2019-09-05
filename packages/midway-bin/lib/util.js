'use strict';
const path = require('path');

function resolveModule(moduleName) {
  if (!moduleName) {
    console.log('[midway-bin] value of framework is blank and skipped.');
    return;
  }

  try {
    require.resolve(moduleName);
    const moduleDir = path.join(__dirname, '../../');
    const moduleFullPath = path.join(moduleDir, moduleName);
    return moduleFullPath;
  } catch (err) {
    console.log(`[midway-bin] Not found framework ${moduleName} and skip.`);
  }
}

exports.resolveModule = resolveModule;
