import { invoke } from '@midwayjs/serverless-invoke';

export function resolveModule(gatewayName: string) {
  const gatewayJSON = require('../gateway.json');
  if (gatewayJSON[gatewayName]) {
    return require(gatewayJSON[gatewayName]);
  } else {
    throw new Error(`unsupport gateway type ${gatewayName}`);
  }
}

export async function invokeFunction(options) {
  return invoke(options);
}
