import { EmptyFramework } from './emptyFramework';
import {
  CONTROLLER_KEY,
  ControllerOption,
  getClassMetadata,
  listModule,
  RouterOption,
  WEB_ROUTER_KEY,
} from '@midwayjs/decorator';

export class WebRouterCollector {
  baseDir: string;
  routes = [];

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async analyze() {
    const framework = new EmptyFramework();
    await framework.initialize({
      baseDir: this.baseDir,
    });

    const controllerModules = listModule(CONTROLLER_KEY);

    for (const module of controllerModules) {
      this.collectRoute(module);
    }

    return this.routes;
  }

  collectRoute(module) {
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      module
    );

    const prefix = controllerOption.prefix;

    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module
    );

    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        this.routes.push({
          name: webRouter.routerName,
          url: prefix + webRouter.path,
          method: webRouter.method,
          description: webRouter.description || '',
          summary: webRouter.summary || '',
        });
      }
    }
  }
}
