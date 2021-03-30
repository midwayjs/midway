import { EmptyFramework } from './emptyFramework';
import {
  CONTROLLER_KEY,
  ControllerOption,
  FUNC_KEY,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  listModule,
  PRIORITY_KEY,
  RouterOption,
  WEB_RESPONSE_KEY,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { MidwayContainer } from '../context/midwayContainer';
import { WebRouterCollector } from './webRouterCollector';

export class ServerlessTriggerCollector extends WebRouterCollector {

  protected async analyze() {
    if (!MidwayContainer.parentDefinitionMetadata) {
      const framework = new EmptyFramework();
      await framework.initialize({
        baseDir: this.baseDir,
      });
    }

    const fnModules = listModule(FUNC_KEY);

    for (const module of fnModules) {
      this.collectFunctionRoute(module);
    }
  }

  protected collectRoute(module) {
    const controllerId = getProviderId(module);
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      module
    );

    // sort for priority
    let priority = getClassMetadata(PRIORITY_KEY, module);
    // implement middleware in controller
    const middleware = controllerOption.routerOptions.middleware;

    const prefix = controllerOption.prefix || '/';
    if (prefix === '/' && priority === undefined) {
      priority = -999;
    }

    if (!this.routes.has(prefix)) {
      this.routes.set(prefix, []);
      this.routesPriority.push({
        prefix,
        priority: priority || 0,
        middleware,
        routerOptions: controllerOption.routerOptions,
        controllerId,
      });
    }

    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module
    );

    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        const routeArgsInfo =
          getPropertyDataFromClass(
            WEB_ROUTER_PARAM_KEY,
            module,
            webRouter.method
          ) || [];

        const routerResponseData =
          getPropertyMetadata(WEB_RESPONSE_KEY, module, webRouter.method) || [];

        this.routes.get(prefix).push({
          prefix,
          routerName: webRouter.routerName || '',
          url: webRouter.path,
          requestMethod: webRouter.requestMethod,
          method: webRouter.method,
          description: webRouter.description || '',
          summary: webRouter.summary || '',
          handlerName: `${controllerId}.${webRouter.method}`,
          funcHandlerName: `${controllerId}.${webRouter.method}`,
          controllerId,
          middleware: webRouter.middleware || [],
          controllerMiddleware: middleware || [],
          requestMetadata: routeArgsInfo,
          responseMetadata: routerResponseData,
        });
      }
    }
  }

  protected collectFunctionRoute(module) {
    const webRouterInfo: Array<{
      funHandler?: string;
      event: string;
      method: string;
      path: string;
      key: string;
      middleware: string[];
    }> = getClassMetadata(FUNC_KEY, module);

    const controllerId = getProviderId(module);

    const prefix = '/';

    if (!this.routes.has(prefix)) {
      this.routes.set(prefix, []);
      this.routesPriority.push({
        prefix,
        priority: -999,
        middleware: [],
        routerOptions: {},
        controllerId,
      });
    }

    for (const webRouter of webRouterInfo) {
      if (webRouter.path) {
        this.routes.get(prefix).push({
          prefix,
          routerName: '',
          url: webRouter.path,
          requestMethod: webRouter.method,
          method: webRouter.key,
          description: '',
          summary: '',
          handlerName: `${controllerId}.${webRouter.key}`,
          funcHandlerName:
            webRouter.funHandler || `${controllerId}.${webRouter.key}`,
          controllerId,
          middleware: webRouter.middleware || [],
          controllerMiddleware: [],
          requestMetadata: [],
          responseMetadata: [],
        });
      }
    }
  }

  public sortRouter(urlMatchList: RouterInfo[]) {
    // 1. 绝对路径规则优先级最高如 /ab/cb/e
    // 2. 星号只能出现最后且必须在/后面，如 /ab/cb/**
    // 3. 如果绝对路径和通配都能匹配一个路径时，绝对规则优先级高
    // 4. 有多个通配能匹配一个路径时，最长的规则匹配，如 /ab/** 和 /ab/cd/** 在匹配 /ab/cd/f 时命中 /ab/cd/**
    // 5. 如果 / 与 /* 都能匹配 / ,但 / 的优先级高于 /*
    return urlMatchList
      .map(item => {
        const urlString = item.url.toString();
        let category = 2;
        const paramString = urlString.includes(':')
          ? urlString.replace(/:.+$/, '')
          : '';
        if (paramString) {
          category = 1;
        }
        if (urlString.includes('*')) {
          category = 0;
        }
        return {
          ...item,
          _pureRouter: urlString.replace(/\**$/, '').replace(/:\w+/, '123'),
          _level: urlString.split('/').length - 1,
          _paramString: paramString,
          _category: category,
        };
      })
      .sort((handlerA, handlerB) => {
        // 不同一层级的对比
        if (handlerA._category !== handlerB._category) {
          return handlerB._category - handlerA._category;
        }
        if (handlerA._level === handlerB._level) {
          if (handlerB._pureRouter === handlerA._pureRouter) {
            return (
              handlerA.url.toString().length - handlerB.url.toString().length
            );
          }
          return handlerB._pureRouter.length - handlerA._pureRouter.length;
        }
        return handlerB._level - handlerA._level;
      });
  }

  async getRoutePriorityList(): Promise<RouterPriority[]> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.routesPriority;
  }

  async getRouterTable(): Promise<Map<string, RouterInfo[]>> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.routes;
  }

  async getFlattenRouterTable(): Promise<RouterInfo[]> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    let routeArr = [];
    for (const routerInfo of this.routes.values()) {
      routeArr = routeArr.concat(routerInfo);
    }
    return routeArr;
  }
}
