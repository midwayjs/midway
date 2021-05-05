import { WebRouterCollector } from './webRouterCollector';

export class ServerlessTriggerCollector extends WebRouterCollector {
  protected async analyze() {
    this.options.includeFunctionRouter = true;
    await super.analyze();
    // requestMethod all transform to other method
    for (const routerInfo of this.routes.values()) {
      for (const info of routerInfo) {
        if (info.requestMethod === 'all') {
          info.functionTriggerMetadata.method = [
            'get',
            'post',
            'put',
            'delete',
            'head',
            'patch',
            'options',
          ];
        }
      }
    }
  }

  protected collectRoute(module) {
    super.collectRoute(module, true);
  }

  protected collectFunctionRoute(module) {
    super.collectFunctionRoute(module, true);
  }

  async getFunctionList(): Promise<any[]> {
    return this.getFlattenRouterTable();
  }
}
