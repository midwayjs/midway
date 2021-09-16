import {
  CONTROLLER_KEY,
  ControllerOption,
  FaaSMetadata,
  FUNC_KEY,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderId,
  isRegExp,
  listModule,
  RouterOption,
  ServerlessTriggerType,
  SERVERLESS_FUNC_KEY,
  WEB_RESPONSE_KEY,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { joinURLPath } from './index';
import { MidwayContainer } from '../context/container';
import { DirectoryFileDetector } from './fileDetector';

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
   *  serverless func load key
   */
  funcHandlerName: string;
  /**
   * controller provideId
   */
  controllerId: string;
  /**
   * router middleware
   */
  middleware: any[];
  /**
   * controller middleware in this router
   */
  controllerMiddleware: any[];
  /**
   * request args metadata
   */
  requestMetadata: any[];
  /**
   * response data metadata
   */
  responseMetadata: any[];
  /**
   * serverless function name
   */
  functionName?: string;
  /**
   * serverless trigger name
   */
  functionTriggerName?: string;
  /**
   * serverless function trigger metadata
   */
  functionTriggerMetadata?: any;
  /**
   * serverless function metadata
   */
  functionMetadata?: any;
}

export interface RouterPriority {
  prefix: string;
  priority: number;
  middleware: any[];
  routerOptions: any;
  controllerId: string;
}

export interface RouterCollectorOptions {
  includeFunctionRouter?: boolean;
}

export class WebRouterCollector {
  protected readonly baseDir: string;
  private isReady = false;
  protected routes = new Map<string, RouterInfo[]>();
  private routesPriority: RouterPriority[] = [];
  protected options: RouterCollectorOptions;

  constructor(baseDir = '', options: RouterCollectorOptions = {}) {
    this.baseDir = baseDir;
    this.options = options;
  }

  protected async analyze() {
    if (this.baseDir) {
      const container = new MidwayContainer();
      container.setFileDetector(
        new DirectoryFileDetector({
          loadDir: this.baseDir,
        })
      );
      await container.ready();
    }
    const controllerModules = listModule(CONTROLLER_KEY);

    for (const module of controllerModules) {
      this.collectRoute(module);
    }

    if (this.options.includeFunctionRouter) {
      const fnModules = listModule(FUNC_KEY);
      for (const module of fnModules) {
        this.collectFunctionRoute(module);
      }
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

  protected collectRoute(module, functionMeta = false) {
    const controllerId = getProviderId(module);
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      module
    );

    let priority;
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

        const data: RouterInfo = {
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
        };

        if (functionMeta) {
          // get function information
          data.functionName = controllerId + '-' + webRouter.method;
          data.functionTriggerName = ServerlessTriggerType.HTTP;
          data.functionTriggerMetadata = {
            path: joinURLPath(prefix, webRouter.path.toString()),
            method: webRouter.requestMethod,
          } as FaaSMetadata.HTTPTriggerOptions;
          data.functionMetadata = {
            functionName: data.functionName,
          };
        }

        this.checkDuplicateAndPush(prefix, data);
      }
    }
  }

  protected collectFunctionRoute(module, functionMeta = false) {
    // 老的函数路由
    const webRouterInfo: Array<
      | {
          funHandler?: string;
          event: string;
          method: string;
          path: string;
          key: string;
          middleware: string[];
        }
      | FaaSMetadata.TriggerMetadata
    > = getClassMetadata(FUNC_KEY, module);

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
      if (webRouter['type']) {
        // 新的 @ServerlessTrigger 写法
        if (webRouter['metadata']?.['path']) {
          const routeArgsInfo =
            getPropertyDataFromClass(
              WEB_ROUTER_PARAM_KEY,
              module,
              webRouter['methodName']
            ) || [];

          const routerResponseData =
            getPropertyMetadata(
              WEB_RESPONSE_KEY,
              module,
              webRouter['methodName']
            ) || [];
          // 新 http/api gateway 函数
          const data: RouterInfo = {
            prefix,
            routerName: '',
            url: webRouter['metadata']['path'],
            requestMethod: webRouter['metadata']?.['method'] ?? 'get',
            method: webRouter['methodName'],
            description: '',
            summary: '',
            handlerName: `${controllerId}.${webRouter['methodName']}`,
            funcHandlerName: `${controllerId}.${webRouter['methodName']}`,
            controllerId,
            middleware: webRouter['metadata']?.['middleware'] || [],
            controllerMiddleware: [],
            requestMetadata: routeArgsInfo,
            responseMetadata: routerResponseData,
          };
          if (functionMeta) {
            data.functionName = webRouter['functionName'];
            data.functionTriggerName = webRouter['type'];
            data.functionTriggerMetadata = webRouter['metadata'];
            const functionMeta =
              getPropertyMetadata(
                SERVERLESS_FUNC_KEY,
                module,
                webRouter['methodName']
              ) || {};
            data.functionMetadata = {
              functionName: webRouter['functionName'],
              ...functionMeta,
            };
          }
          this.checkDuplicateAndPush(prefix, data);
        } else {
          if (functionMeta) {
            const functionMeta =
              getPropertyMetadata(
                SERVERLESS_FUNC_KEY,
                module,
                webRouter['methodName']
              ) || {};
            // 其他类型的函数
            this.checkDuplicateAndPush(prefix, {
              prefix,
              routerName: '',
              url: '',
              requestMethod: '',
              method: webRouter['methodName'],
              description: '',
              summary: '',
              handlerName: `${controllerId}.${webRouter['methodName']}`,
              funcHandlerName: `${controllerId}.${webRouter['methodName']}`,
              controllerId,
              middleware: [],
              controllerMiddleware: [],
              requestMetadata: [],
              responseMetadata: [],
              functionName: webRouter['functionName'],
              functionTriggerName: webRouter['type'],
              functionTriggerMetadata: webRouter['metadata'],
              functionMetadata: {
                functionName: webRouter['functionName'],
                ...functionMeta,
              },
            });
          }
        }
      } else {
        // 老的 @Func 写法
        if (webRouter['path'] || webRouter['middleware']) {
          const data: RouterInfo = {
            prefix,
            routerName: '',
            url: webRouter['path'] ?? '',
            requestMethod: webRouter['method'] ?? 'get',
            method: webRouter['key'] ?? '',
            description: '',
            summary: '',
            handlerName: `${controllerId}.${webRouter['key']}`,
            funcHandlerName:
              webRouter['funHandler'] || `${controllerId}.${webRouter['key']}`,
            controllerId,
            middleware: webRouter['middleware'] || [],
            controllerMiddleware: [],
            requestMetadata: [],
            responseMetadata: [],
          };
          if (functionMeta) {
            // get function information
            data.functionName = controllerId + '-' + (webRouter['key'] ?? '');
            data.functionTriggerName = ServerlessTriggerType.HTTP;
            data.functionTriggerMetadata = {
              path: webRouter['path'] ?? '/',
              method: webRouter['method'] ?? 'get',
            };
            data.functionMetadata = {
              functionName: data.functionName,
            };
          }
          // 老函数的 http
          this.checkDuplicateAndPush(prefix, data);
        } else {
          if (functionMeta) {
            // 非 http
            this.checkDuplicateAndPush(prefix, {
              prefix,
              routerName: '',
              url: '',
              requestMethod: '',
              method: webRouter['key'],
              description: '',
              summary: '',
              handlerName: `${controllerId}.${webRouter['key']}`,
              funcHandlerName:
                webRouter['funHandler'] ||
                `${controllerId}.${webRouter['key']}`,
              controllerId,
              middleware: webRouter['middleware'] || [],
              controllerMiddleware: [],
              requestMetadata: [],
              responseMetadata: [],
              functionName: webRouter['functionName'],
              functionTriggerName: webRouter['type'],
              functionTriggerMetadata: webRouter['metadata'],
              functionMetadata: {
                functionName: webRouter['functionName'],
              },
            });
          }
        }
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
        const weightArr = isRegExp(item.url)
          ? urlString.split('/')
          : urlString.split('/');
        let weight = 0;
        // 权重，比如通配的不加权，非通配加权，防止通配出现在最前面
        for (const fragment of weightArr) {
          if (fragment.includes(':') || fragment.includes('*')) {
            weight += 0;
          } else {
            weight += 1;
          }
        }

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
          _weight: weight,
        };
      })
      .sort((handlerA, handlerB) => {
        // 不同一层级的对比
        if (handlerA._category !== handlerB._category) {
          return handlerB._category - handlerA._category;
        }
        // 不同长度
        if (handlerA._level === handlerB._level) {
          // 不同权重
          if (handlerA._weight !== handlerB._weight) {
            return handlerB._weight - handlerA._weight;
          }

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

  private checkDuplicateAndPush(prefix, routerInfo: RouterInfo) {
    const prefixList = this.routes.get(prefix);
    const matched = prefixList.filter(item => {
      return (
        routerInfo.url &&
        routerInfo.requestMethod &&
        item.url === routerInfo.url &&
        item.requestMethod === routerInfo.requestMethod
      );
    });
    if (matched && matched.length) {
      throw new Error(
        `Duplicate router "${routerInfo.requestMethod} ${routerInfo.url}" at "${matched[0].handlerName}" and "${routerInfo.handlerName}"`
      );
    }
    prefixList.push(routerInfo);
  }
}
