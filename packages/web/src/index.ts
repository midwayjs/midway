import { startCluster as eggStartCluster } from 'egg-cluster';
import { join } from 'path';

export * from './interface';
export { MidwayWebFramework as Framework } from './framework/web';
export {
  createEggApplication,
  createEggAgent,
  createAppWorkerLoader,
  createAgentWorkerLoader,
} from './base';
export { Application, Agent } from './application';
export { EggConfiguration as Configuration } from './configuration';
export * from './decorator';
export function startCluster(serverConfig, callback?) {
  if (!serverConfig['require']) {
    serverConfig['require'] = [];
  }
  if (!Array.isArray(serverConfig['require'])) {
    serverConfig['require'] = [serverConfig['require']];
  }
  serverConfig['require'].push(join(__dirname, 'cluster'));
  return eggStartCluster(serverConfig, callback);
}
