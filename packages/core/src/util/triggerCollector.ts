import { WebRouterCollector } from './webRouterCollector';

export class ServerlessTriggerCollector extends WebRouterCollector {
  protected async analyze() {
    this.options.includeFunctionRouter = true;
    return super.analyze();
  }

  protected collectRoute(module) {
    super.collectRoute(module, true);
  }

  collectFunctionRoute(module) {
    super.collectFunctionRoute(module, true);
  }

  async getFunctionList(): Promise<any[]> {
    return this.getFlattenRouterTable();
  }
}
