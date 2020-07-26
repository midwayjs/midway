import { invoke } from '@midwayjs/serverless-invoke';
import { resolve } from 'path';
import { existsSync, removeSync } from 'fs-extra';
export function resolveModule(gatewayName: string) {
  const gatewayJSON = require('../gateway.json');
  if (gatewayJSON[gatewayName]) {
    return require(gatewayJSON[gatewayName]);
  } else {
    throw new Error(`unsupport gateway type ${gatewayName}`);
  }
}

export async function invokeFunction(options) {
  if (!process.env.MIDWAY_DEV_PACK_START) {
    const baseDir = options.functionDir || process.cwd();
    const buildDir = resolve(baseDir, '.faas_debug_tmp');
    if (existsSync(buildDir)) {
      removeSync(buildDir);
    }
    process.env.MIDWAY_DEV_PACK_START = 'true';
  }
  return invoke(options);
}
