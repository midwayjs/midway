import { EmptyFramework } from './emptyFramework';
import {
  CONTROLLER_KEY,
  ControllerOption,
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

export interface RouterInfo {
  /**
   * router prefix
   */
  prefix: string;
  /**
   * router alias name
   */
  routerName: string;
  /**
   * router path, without prefix
   */
  url: string | RegExp;
  /**
   * request method for http, like get/post/delete
   */
  requestMethod: string;
  /**
   * invoke function method
   */
  method: string;
  description: string;
  summary: string;
  /**
   * router handler function key，for IoC container load
   */
  handlerName: string;

  /**
   * controller provideId
   */
  controllerId: string;
  /**
   * router middleware
   */
  middleware: any[];

  /**
   * request args metadata
   */
  requestMetadata: any[];

  /**
   * response data metadata
   */
  responseMetadata: any[];
}

export interface RouterPriority {
  prefix: string;
  priority: number;
  middleware: any[];
}

export class WebRouterCollector {
  private readonly baseDir: string;
  private routes = new Map<string, RouterInfo[]>();
  private routesPriority: RouterPriority[] = [];
  private isReady = false;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || '';
  }

  protected async analyze() {
    const framework = new EmptyFramework();
    await framework.initialize({
      baseDir: this.baseDir,
    });

    const controllerModules = listModule(CONTROLLER_KEY);

    for (const module of controllerModules) {
      this.collectRoute(module);
    }

    // sort router
    for (const prefix of this.routes.keys()) {
      const routerInfo = this.routes.get(prefix);
      this.routes.set(prefix, this.sortRouter(routerInfo));
    }

    // sort prefix
    this.routesPriority = this.routesPriority.sort((routeA, routeB) => {
      return routeB.priority - routeA.priority;
    });
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
    const middlewares = controllerOption.routerOptions.middleware;

    const prefix = controllerOption.prefix || '/';
    if (prefix === '/' && priority === undefined) {
      priority = -999;
    }

    if (!this.routes.has(prefix)) {
      this.routes.set(prefix, []);
      this.routesPriority.push({
        prefix,
        priority: priority || 0,
        middleware: middlewares,
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
          controllerId,
          middleware: webRouter.middleware,
          requestMetadata: routeArgsInfo,
          responseMetadata: routerResponseData,
        });
      }
    }
  }

  protected sortRouter(urlMatchList: RouterInfo[]) {
    // 1. 绝对路径规则优先级最高如 /ab/cb/e
    // 2. 星号只能出现最后且必须在/后面，如 /ab/cb/**
    // 3. 如果绝对路径和通配都能匹配一个路径时，绝对规则优先级高
    // 4. 有多个通配能匹配一个路径时，最长的规则匹配，如 /ab/** 和 /ab/cd/** 在匹配 /ab/cd/f 时命中 /ab/cd/**
    // 5. 如果 / 与 /* 都能匹配 / ,但 / 的优先级高于 /*
    return urlMatchList
      .map(item => {
        return {
          ...item,
          pureRouter: item.url.toString().replace(/\**$/, ''),
          level: item.url.toString().split('/').length - 1,
        };
      })
      .sort((handlerA, handlerB) => {
        if (handlerA.level === handlerB.level) {
          if (handlerB.pureRouter === handlerA.pureRouter) {
            return (
              handlerA.url.toString().length - handlerB.url.toString().length
            );
          }
          return handlerB.pureRouter.length - handlerA.pureRouter.length;
        }
        return handlerB.level - handlerA.level;
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
