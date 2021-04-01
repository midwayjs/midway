import { WebRouterCollector } from './webRouterCollector';

export class ServerlessTriggerCollector extends WebRouterCollector {
  collectRoute(module) {
    this.options.includeFunctionRouter = true;
    super.collectRoute(module, true);
  }

  collectFunctionRoute(module) {
    super.collectFunctionRoute(module, true);
  }

  async getFunctionList(): Promise<any[]> {
    return this.getFlattenRouterTable();
  }
}
