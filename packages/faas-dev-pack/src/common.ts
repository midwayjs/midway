import { transform } from '@midwayjs/serverless-spec-builder';
import { join } from 'path';
import { invoke } from '@midwayjs/serverless-invoke';

const matchTrigger = (
  config: any,
  functionName: string,
  triggerType: string
): boolean => {
  // 拿到函数名，通用 mtop 的情况
  if (config.functions?.[functionName]?.events?.[0]?.[triggerType]) {
    return true;
  }

  return false;
};

export async function getGatewayFromConfig(
  baseDir: string,
  sourceDir: string,
  req
) {
  const config: any = transform(join(baseDir, 'f.yml'));
  const gatewayType = config?.apiGateway?.type;
  if (gatewayType) {
    // mtop 自定义网关
    return gatewayType;
  } else {
    const functionName = req.query['functionName'];
    // 拿到函数名，通用 mtop 的情况
    if (functionName && matchTrigger(config, functionName, 'mtop')) {
      return 'mtop';
    }

    return 'http';
  }
}

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
