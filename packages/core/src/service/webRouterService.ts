import {
  CONTROLLER_KEY,
  ControllerOption,
  DecoratorManager,
  Inject,
  Provide,
  RouterOption,
  Scope,
  WEB_RESPONSE_KEY,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  FUNCTIONAL_API_CONTROLLER_KEY,
} from '../decorator';
import { joinURLPath } from '../util';
import {
  MidwayCommonError,
  DuplicateRouteErrorPayload,
  MidwayDuplicateControllerOptionsError,
  MidwayDuplicateRouteError,
} from '../error';
import * as util from 'util';
import { PathToRegexpUtil } from '../util/pathToRegexp';
import { Types } from '../util/types';
import { ServerlessTriggerType, ScopeEnum, FaaSMetadata } from '../interface';
import { MetadataManager } from '../decorator/metadataManager';
import { MidwayLoggerService } from './loggerService';

const debug = util.debuglog('midway:debug');

export interface RouterInfo {
  /**
   * uuid
   */
  id?: string;
  /**
   * router prefix from controller
   */
  prefix?: string;
  /**
   * router alias name
   */
  routerName?: string;
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
  method: string | ((...args: any[]) => void);
  /**
   * router description
   */
  description?: string;
  /**
   * @deprecated
   */
  summary?: string;
  /**
   * router handler function key，for IoC container load
   */
  handlerName?: string;
  /**
   *  serverless func load key, will be override by @ServerlessTrigger and @ServerlessFunction
   */
  funcHandlerName?: string;
  /**
   * controller provideId
   */
  controllerId?: string;
  /**
   * controller class
   */
  controllerClz?: new (...args) => any;
  /**
   * router middleware
   */
  middleware?: any[];
  /**
   * controller middleware in this router
   */
  controllerMiddleware?: any[];
  /**
   * request args metadata
   */
  requestMetadata?: any[];
  /**
   * response data metadata
   */
  responseMetadata?: any[];
  /**
   * serverless function name, will be override by @ServerlessTrigger and @ServerlessFunction
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

  /**
   * url with prefix
   */
  fullUrl?: string;

  /**
   * pattern after path-regexp compile
   */
  fullUrlCompiledRegexp?: RegExp;

  /**
   * url after wildcard and can be path-to-regexp by path-to-regexp v6
   */
  fullUrlFlattenString?: string;

  /**
   * version information for API versioning
   */
  version?: string | string[];

  /**
   * version type for API versioning
   */
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';

  /**
   * version prefix for URI versioning
   */
  versionPrefix?: string;

  /**
   * route definition source
   */
  source?: 'functional' | 'decorator';

  /**
   * route-level ignore global prefix
   */
  ignoreGlobalPrefix?: boolean;
}

export interface RouteManifestItem {
  source: 'functional' | 'decorator';
  operationId: string;
  controllerId?: string;
  controllerPrefix: string;
  method: string;
  path: string;
  fullPath: string;
  routerName?: string;
  middlewareCount: number;
  ignoreGlobalPrefix: boolean;
  version?: string | string[];
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
  versionPrefix?: string;
  summary?: string;
  description?: string;
}

export type DynamicRouterInfo = Omit<
  RouterInfo,
  'id' | 'method' | 'controllerId' | 'controllerMiddleware' | 'responseMetadata'
>;

export interface RouterPriority {
  prefix: string;
  priority: number;
  middleware: any[];
  routerOptions: any;
  controllerId: string;
  /**
   * 路由控制器或者函数 module 本身
   */
  routerModule: any;
}

export interface RouterCollectorOptions {
  includeFunctionRouter?: boolean;
  globalPrefix?: string;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayWebRouterService {
  private isReady = false;
  protected routes = new Map<string, RouterInfo[]>();
  protected routesPriority: RouterPriority[] = [];

  @Inject()
  loggerService: MidwayLoggerService;

  constructor(readonly options: RouterCollectorOptions = {}) {}

  protected async analyze() {
    this.analyzeController();
    this.sortPrefixAndRouter();
  }

  protected analyzeController() {
    const controllerModules = DecoratorManager.listModule(CONTROLLER_KEY);
    const dedupedControllerModules: any[] = [];
    const functionalControllerIndexMap = new Map<string, number>();

    for (const module of controllerModules) {
      const isFunctionalController = !!MetadataManager.getOwnMetadata(
        FUNCTIONAL_API_CONTROLLER_KEY,
        module
      );
      if (!isFunctionalController) {
        dedupedControllerModules.push(module);
        continue;
      }

      const controllerOption: ControllerOption = MetadataManager.getOwnMetadata(
        CONTROLLER_KEY,
        module
      );
      const webRouterInfo: RouterOption[] = MetadataManager.getOwnMetadata(
        WEB_ROUTER_KEY,
        module
      );
      if (!controllerOption || !webRouterInfo) {
        dedupedControllerModules.push(module);
        continue;
      }

      // Deduplicate only when controller prefix + route signatures are exactly the same.
      // This keeps "double evaluation of same module" safe while preserving distinct APIs
      // that happen to share class name or route method names.
      const routeSignatures = webRouterInfo
        .map(item => {
          return `${(item.requestMethod || '').toLowerCase()}|${String(
            item.path || '/'
          )}|${item.routerName || ''}|${item.method || ''}`;
        })
        .sort()
        .join(';');
      const controllerSignature = `${
        controllerOption.prefix || '/'
      }::${routeSignatures}`;

      const existingIndex =
        functionalControllerIndexMap.get(controllerSignature);
      if (typeof existingIndex === 'number') {
        dedupedControllerModules[existingIndex] = module;
      } else {
        functionalControllerIndexMap.set(
          controllerSignature,
          dedupedControllerModules.length
        );
        dedupedControllerModules.push(module);
      }
    }

    for (const module of dedupedControllerModules) {
      const controllerOption: ControllerOption = MetadataManager.getOwnMetadata(
        CONTROLLER_KEY,
        module
      );
      this.addController(
        module,
        controllerOption,
        this.options.includeFunctionRouter
      );
    }
  }

  protected sortPrefixAndRouter() {
    // filter empty prefix
    this.routesPriority = this.routesPriority.filter(item => {
      const prefixList = this.routes.get(item.prefix);
      if (prefixList.length > 0) {
        return true;
      } else {
        this.routes.delete(item.prefix);
        return false;
      }
    });

    // sort router
    for (const prefix of this.routes.keys()) {
      const routerInfo = this.routes.get(prefix);
      this.routes.set(prefix, this.sortRouter(routerInfo));
    }

    // sort prefix
    this.routesPriority = this.routesPriority.sort((routeA, routeB) => {
      return routeB.prefix.length - routeA.prefix.length;
    });
  }

  /**
   * dynamically add a controller
   * @param controllerClz
   * @param controllerOption
   * @param functionMeta
   */
  public addController(
    controllerClz: any,
    controllerOption: ControllerOption,
    functionMeta?: boolean
  );
  public addController(
    controllerClz: any,
    controllerOption: ControllerOption,
    resourceOptions?: {
      resourceFilter: (routerInfo: RouterInfo) => boolean;
    },
    functionMeta?: boolean
  );
  public addController(
    controllerClz: any,
    controllerOption: ControllerOption,
    resourceOptions: any = {},
    functionMeta = false
  ) {
    if (resourceOptions && typeof resourceOptions === 'boolean') {
      functionMeta = resourceOptions;
      resourceOptions = undefined;
    }

    if (!resourceOptions) {
      resourceOptions = {};
    }

    const controllerId = DecoratorManager.getProviderName(controllerClz);
    debug(`[core]: Found Controller ${controllerId}.`);
    const id = DecoratorManager.getProviderUUId(controllerClz);

    controllerOption.routerOptions = controllerOption.routerOptions || {};

    let priority;
    // implement middleware in controller
    const middleware = controllerOption.routerOptions.middleware;
    const controllerIgnoreGlobalPrefix =
      !!controllerOption.routerOptions?.ignoreGlobalPrefix;
    const controllerVersion = controllerOption.routerOptions?.version;
    const controllerVersionType = controllerVersion
      ? controllerOption.routerOptions?.versionType || 'URI'
      : undefined;
    const controllerVersionPrefix =
      controllerVersionType === 'URI'
        ? controllerOption.routerOptions?.versionPrefix || 'v'
        : controllerOption.routerOptions?.versionPrefix;

    let prefixWithGlobal = joinURLPath(
      this.options.globalPrefix,
      controllerOption.prefix || '/'
    );
    const rawIgnorePrefix = controllerOption.prefix || '/';
    let ignorePrefix = rawIgnorePrefix;

    // Apply version prefix for URI versioning
    if (controllerVersion && controllerVersionType === 'URI') {
      const version = Array.isArray(controllerVersion)
        ? controllerVersion[0]
        : controllerVersion;

      const versionedPrefix = `/${controllerVersionPrefix}${version}`;

      prefixWithGlobal = joinURLPath(
        this.options.globalPrefix,
        versionedPrefix,
        controllerOption.prefix || '/'
      );
      ignorePrefix = joinURLPath(versionedPrefix, rawIgnorePrefix);
    }

    if (/\*/.test(prefixWithGlobal)) {
      throw new MidwayCommonError(
        `Router prefix ${prefixWithGlobal} can't set string with *`
      );
    }

    // set prefix with global
    if (!this.routes.has(prefixWithGlobal)) {
      this.routes.set(prefixWithGlobal, []);
      this.routesPriority.push({
        prefix: prefixWithGlobal,
        priority: prefixWithGlobal === '/' && priority === undefined ? -999 : 0,
        middleware,
        routerOptions: controllerOption.routerOptions,
        controllerId,
        routerModule: controllerClz,
      });
    } else {
      // 不同的 controller，可能会有相同的 prefix，一旦 options 不同，就要报错
      if (middleware && middleware.length > 0) {
        const originRoute = this.routesPriority.filter(el => {
          return el.prefix === prefixWithGlobal;
        })[0];
        throw new MidwayDuplicateControllerOptionsError(
          prefixWithGlobal,
          controllerId,
          originRoute.controllerId
        );
      }
    }

    const webRouterInfo: RouterOption[] = MetadataManager.getOwnMetadata(
      WEB_ROUTER_KEY,
      controllerClz
    );
    const hasRouteIgnoreGlobalPrefix =
      !!webRouterInfo &&
      webRouterInfo.some(route => route?.ignoreGlobalPrefix === true);

    // set ignorePrefix only when it can be matched
    if (controllerIgnoreGlobalPrefix || hasRouteIgnoreGlobalPrefix) {
      if (!this.routes.has(ignorePrefix)) {
        this.routes.set(ignorePrefix, []);
        this.routesPriority.push({
          prefix: ignorePrefix,
          priority: ignorePrefix === '/' && priority === undefined ? -999 : 0,
          middleware,
          routerOptions: controllerOption.routerOptions,
          controllerId,
          routerModule: controllerClz,
        });
      }
    }

    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        const isRouteIgnoreGlobalPrefixConfigured =
          webRouter.__ignoreGlobalPrefixConfigured === true;
        const routeArgsInfo =
          MetadataManager.getOwnMetadata(
            WEB_ROUTER_PARAM_KEY,
            controllerClz,
            webRouter.method
          ) || [];

        const routerResponseData =
          MetadataManager.getOwnMetadata(
            WEB_RESPONSE_KEY,
            controllerClz,
            webRouter.method
          ) || [];

        const data: RouterInfo = {
          id,
          // route-level value overrides controller default when explicitly set
          prefix: isRouteIgnoreGlobalPrefixConfigured
            ? webRouter.ignoreGlobalPrefix
              ? ignorePrefix
              : prefixWithGlobal
            : controllerIgnoreGlobalPrefix
            ? ignorePrefix
            : prefixWithGlobal,
          routerName: webRouter.routerName || '',
          url: webRouter.path,
          requestMethod: webRouter.requestMethod,
          method: webRouter.method,
          description: webRouter.description || '',
          summary: webRouter.summary || '',
          handlerName: `${controllerId}.${webRouter.method}`,
          funcHandlerName: `${controllerId}.${webRouter.method}`,
          controllerId,
          controllerClz,
          middleware: webRouter.middleware || [],
          controllerMiddleware: middleware || [],
          requestMetadata: routeArgsInfo,
          responseMetadata: routerResponseData,
        };

        const isFunctionalController = !!MetadataManager.getOwnMetadata(
          FUNCTIONAL_API_CONTROLLER_KEY,
          controllerClz
        );
        if (isFunctionalController) {
          data.source = 'functional';
        }
        if (
          isRouteIgnoreGlobalPrefixConfigured ||
          controllerIgnoreGlobalPrefix
        ) {
          const resolvedIgnoreGlobalPrefix = isRouteIgnoreGlobalPrefixConfigured
            ? !!webRouter.ignoreGlobalPrefix
            : controllerIgnoreGlobalPrefix;
          if (resolvedIgnoreGlobalPrefix) {
            data.ignoreGlobalPrefix = true;
          }
        }
        if (controllerVersion) {
          data.version = controllerVersion;
          data.versionType = controllerVersionType;
          data.versionPrefix = controllerVersionPrefix;
        }

        if (functionMeta) {
          // get function information
          data.functionName = controllerId + '-' + webRouter.method;
          data.functionTriggerName = ServerlessTriggerType.HTTP;
          data.functionTriggerMetadata = {
            path: joinURLPath(data.prefix, webRouter.path.toString()),
            method: webRouter.requestMethod,
          } as FaaSMetadata.HTTPTriggerOptions;
          data.functionMetadata = {
            functionName: data.functionName,
          };
        }
        if (
          resourceOptions.resourceFilter &&
          !resourceOptions.resourceFilter(data)
        ) {
          continue;
        }

        this.checkDuplicateAndPush(data.prefix, data);
      }
    }
  }

  /**
   * dynamically add a route to root prefix
   * @param routerFunction
   * @param routerInfoOption
   */
  public addRouter(
    routerFunction: (...args) => void,
    routerInfoOption: DynamicRouterInfo
  ) {
    const prefix = routerInfoOption.prefix || '';
    routerInfoOption.requestMethod = (
      routerInfoOption.requestMethod || 'GET'
    ).toUpperCase();

    if (!this.routes.has(prefix)) {
      this.routes.set(prefix, []);
      this.routesPriority.push({
        prefix,
        priority: 0,
        middleware: [],
        routerOptions: {},
        controllerId: undefined,
        routerModule: undefined,
      });
    }

    this.checkDuplicateAndPush(
      prefix,
      Object.assign(routerInfoOption, {
        method: routerFunction,
      })
    );

    // sort again
    this.sortPrefixAndRouter();
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
        const weightArr = Types.isRegExp(item.url)
          ? urlString.split('\\/')
          : urlString.split('/');
        let weight = 0;
        // 权重，比如通配的不加权，非通配加权，防止通配出现在最前面
        for (const fragment of weightArr) {
          if (
            fragment === '' ||
            fragment.includes(':') ||
            fragment.includes('*')
          ) {
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

        // 不同权重
        if (handlerA._weight !== handlerB._weight) {
          return handlerB._weight - handlerA._weight;
        }

        // 不同长度
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

  public async getRoutePriorityList(): Promise<RouterPriority[]> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.routesPriority;
  }

  public async getRouterTable(): Promise<Map<string, RouterInfo[]>> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.routes;
  }

  public async getFlattenRouterTable(
    options: {
      compileUrlPattern?: boolean;
    } = {}
  ): Promise<RouterInfo[]> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    let routeArr = [];
    for (const routerPriority of this.routesPriority) {
      routeArr = routeArr.concat(this.routes.get(routerPriority.prefix));
    }
    if (options.compileUrlPattern) {
      // attach match pattern function
      for (const item of routeArr) {
        if (item.fullUrlFlattenString) {
          item.fullUrlCompiledRegexp = PathToRegexpUtil.toRegexp(
            item.fullUrlFlattenString
          );
        }
      }
    }
    return routeArr;
  }

  public async getMatchedRouterInfo(
    routerUrl: string,
    method: string
  ): Promise<RouterInfo | undefined> {
    const routes = await this.getFlattenRouterTable({
      compileUrlPattern: true,
    });
    let matchedRouterInfo;
    for (const item of routes) {
      if (item.fullUrlCompiledRegexp) {
        const itemRequestMethod = item['requestMethod'].toUpperCase();
        if (
          ('ALL' === itemRequestMethod ||
            method.toUpperCase() === itemRequestMethod) &&
          item.fullUrlCompiledRegexp.test(routerUrl)
        ) {
          matchedRouterInfo = item;
          break;
        }
      }
    }
    return matchedRouterInfo;
  }

  public async getRouteManifest(): Promise<RouteManifestItem[]> {
    const routes = await this.getFlattenRouterTable();
    const manifest = routes.map(route => ({
      source: route.source ?? 'decorator',
      operationId: this.getOperationId(route),
      controllerId: route.controllerId,
      controllerPrefix: route.prefix || '',
      method: route.requestMethod,
      path: route.url?.toString() || '',
      fullPath: route.fullUrl || '',
      routerName: route.routerName,
      middlewareCount:
        (route.middleware?.length || 0) +
        (route.controllerMiddleware?.length || 0),
      ignoreGlobalPrefix: !!route.ignoreGlobalPrefix,
      version: route.version,
      versionType: route.versionType,
      versionPrefix: route.versionPrefix,
      summary: route.summary,
      description: route.description,
    }));
    this.checkDuplicateOperationId(manifest);
    return manifest;
  }

  protected checkDuplicateAndPush(prefix, routerInfo: RouterInfo) {
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
      const existingRoute = matched[0];
      const fullPath =
        existingRoute.fullUrl ||
        (typeof routerInfo.url === 'string'
          ? joinURLPath(prefix, routerInfo.url)
          : `${prefix}${routerInfo.url?.toString() || ''}`);
      const payload: DuplicateRouteErrorPayload = {
        code: 'MIDWAY_DUPLICATE_ROUTE',
        method: (routerInfo.requestMethod || '').toUpperCase(),
        fullPath,
        existing: {
          source: existingRoute.source ?? 'decorator',
          handler: this.getRouterHandlerIdentity(existingRoute),
        },
        current: {
          source: routerInfo.source ?? 'decorator',
          handler: this.getRouterHandlerIdentity(routerInfo),
        },
      };
      throw new MidwayDuplicateRouteError(
        `${routerInfo.requestMethod} ${routerInfo.url}`,
        payload.existing.handler,
        payload.current.handler,
        payload
      );
    }
    // format url
    if (
      !routerInfo.fullUrlFlattenString &&
      routerInfo.url &&
      typeof routerInfo.url === 'string'
    ) {
      routerInfo.fullUrl = joinURLPath(prefix, routerInfo.url);
      if (/\*$/.test(routerInfo.fullUrl)) {
        routerInfo.fullUrlFlattenString = routerInfo.fullUrl.replace(
          '*',
          '(.*)'
        );
      } else {
        routerInfo.fullUrlFlattenString = routerInfo.fullUrl;
      }
    }
    prefixList.push(routerInfo);
    this.logRouteLoaded(routerInfo);
  }

  protected logRouteLoaded(routerInfo: RouterInfo) {
    const fullPath =
      routerInfo.fullUrl ||
      (typeof routerInfo.url === 'string'
        ? joinURLPath(routerInfo.prefix || '', routerInfo.url)
        : `${routerInfo.prefix || ''}${routerInfo.url?.toString() || ''}`);
    const logger = this.loggerService?.getLogger('appLogger');
    if (!logger || typeof logger.info !== 'function') {
      return;
    }
    logger.info(
      '[midway:router] loaded route %s %s -> %s (%s)',
      (routerInfo.requestMethod || 'ALL').toUpperCase(),
      fullPath,
      this.getRouterHandlerIdentity(routerInfo),
      routerInfo.source ?? 'decorator'
    );
  }

  protected getRouterHandlerIdentity(routerInfo: RouterInfo) {
    if (routerInfo.handlerName) {
      return routerInfo.handlerName;
    }
    if (typeof routerInfo.method === 'string') {
      return routerInfo.controllerId
        ? `${routerInfo.controllerId}.${routerInfo.method}`
        : routerInfo.method;
    }
    if (typeof routerInfo.method === 'function') {
      return routerInfo.method.name || 'anonymous';
    }
    return 'unknown';
  }

  protected getOperationId(routeInfo: RouterInfo) {
    if (routeInfo.routerName) {
      return routeInfo.routerName;
    }
    const fullPath = routeInfo.fullUrl || routeInfo.url?.toString() || '/';
    return `${(routeInfo.requestMethod || 'all').toLowerCase()}_${fullPath
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;
  }

  protected checkDuplicateOperationId(manifest: RouteManifestItem[]) {
    const operationMap = new Map<string, RouteManifestItem>();
    for (const route of manifest) {
      const exist = operationMap.get(route.operationId);
      if (exist) {
        throw new MidwayCommonError(
          `Duplicate operationId "${
            route.operationId
          }" between "${exist.method.toUpperCase()} ${
            exist.fullPath
          }" and "${route.method.toUpperCase()} ${route.fullPath}"`
        );
      }
      operationMap.set(route.operationId, route);
    }
  }
}
