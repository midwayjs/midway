import { WebRouterCollector } from './webRouterCollector';

export class ServerlessTriggerCollector extends WebRouterCollector {
  collectFunctionRoute(module) {
    super.collectFunctionRoute(module, true);
  }

  async getFunctionList(): Promise<any[]> {
    return this.getFlattenRouterTable();
  }
}
