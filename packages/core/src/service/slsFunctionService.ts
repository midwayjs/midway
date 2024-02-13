import {
  FUNC_KEY,
  getClassMetadata,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getProviderName,
  getProviderUUId,
  listModule,
  Provide,
  Scope,
  SERVERLESS_FUNC_KEY,
  WEB_RESPONSE_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '../decorator';
import {
  MidwayWebRouterService,
  RouterCollectorOptions,
  RouterInfo,
} from './webRouterService';
import { FaaSMetadata, ScopeEnum } from '../interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayServerlessFunctionService extends MidwayWebRouterService {
  constructor(readonly options: RouterCollectorOptions = {}) {
    super(
      Object.assign({}, options, {
        includeFunctionRouter: true,
      })
    );
  }

  protected async analyze() {
    this.analyzeController();
    this.analyzeFunction();
    this.sortPrefixAndRouter();
    // requestMethod all transform to other method
    for (const routerInfo of this.routes.values()) {
      for (const info of routerInfo) {
        if (info.requestMethod === 'all') {
          info.functionTriggerMetadata = info.functionTriggerMetadata || {};
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

  protected analyzeFunction() {
    const fnModules = listModule(FUNC_KEY);
    for (const module of fnModules) {
      this.collectFunctionRoute(module);
    }
  }

  protected collectFunctionRoute(module) {
    // serverlessTrigger metadata
    const webRouterInfo: Array<FaaSMetadata.TriggerMetadata> = getClassMetadata(
      FUNC_KEY,
      module
    );

    const controllerId = getProviderName(module);
    const id = getProviderUUId(module);

    const prefix = '/';

    if (!this.routes.has(prefix)) {
      this.routes.set(prefix, []);
      this.routesPriority.push({
        prefix,
        priority: -999,
        middleware: [],
        routerOptions: {},
        controllerId,
        routerModule: module,
      });
    }

    for (const webRouter of webRouterInfo) {
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
          id,
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
        const functionMeta =
          getPropertyMetadata(
            SERVERLESS_FUNC_KEY,
            module,
            webRouter['methodName']
          ) || {};
        const functionName =
          functionMeta['functionName'] ??
          webRouter?.['metadata']?.['functionName'] ??
          createFunctionName(module, webRouter['methodName']);
        const funcHandlerName =
          functionMeta['handlerName'] ??
          webRouter?.['metadata']?.['handlerName'] ??
          data.funcHandlerName;
        data.functionName = functionName;
        data.funcHandlerName = funcHandlerName;
        data.functionTriggerName = webRouter['type'];
        data.functionTriggerMetadata = webRouter['metadata'];
        data.functionMetadata = {
          functionName,
          ...functionMeta,
        };
        this.checkDuplicateAndPush(prefix, data);
      } else {
        const functionMeta =
          getPropertyMetadata(
            SERVERLESS_FUNC_KEY,
            module,
            webRouter['methodName']
          ) || {};
        const functionName =
          functionMeta['functionName'] ??
          webRouter?.['metadata']?.['functionName'] ??
          createFunctionName(module, webRouter['methodName']);

        const funcHandlerName =
          functionMeta['handlerName'] ??
          webRouter?.['metadata']?.['handlerName'] ??
          `${controllerId}.${webRouter['methodName']}`;
        // 其他类型的函数
        this.checkDuplicateAndPush(prefix, {
          id,
          prefix,
          routerName: '',
          url: '',
          requestMethod: '',
          method: webRouter['methodName'],
          description: '',
          summary: '',
          handlerName: `${controllerId}.${webRouter['methodName']}`,
          funcHandlerName: funcHandlerName,
          controllerId,
          middleware: webRouter['metadata']?.['middleware'] || [],
          controllerMiddleware: [],
          requestMetadata: [],
          responseMetadata: [],
          functionName,
          functionTriggerName: webRouter['type'],
          functionTriggerMetadata: webRouter['metadata'],
          functionMetadata: {
            functionName,
            ...functionMeta,
          },
        });
      }
    }
  }

  public async getFunctionList(): Promise<RouterInfo[]> {
    return this.getFlattenRouterTable({
      compileUrlPattern: true,
    });
  }

  public addServerlessFunction(
    func: (...args) => Promise<any>,
    triggerOptions: FaaSMetadata.TriggerMetadata,
    functionOptions: FaaSMetadata.ServerlessFunctionOptions = {}
  ) {
    const prefix = '';

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

    const functionName =
      triggerOptions.functionName ?? functionOptions.functionName;
    this.checkDuplicateAndPush(prefix, {
      id: null,
      method: func,
      url: triggerOptions.metadata['path'] || '',
      requestMethod: triggerOptions.metadata['method'] || '',
      description: '',
      summary: '',
      handlerName: '',
      funcHandlerName:
        triggerOptions.handlerName || functionOptions.handlerName,
      controllerId: '',
      middleware: triggerOptions.metadata?.middleware || [],
      controllerMiddleware: [],
      requestMetadata: [],
      responseMetadata: [],
      functionName,
      functionTriggerName: triggerOptions.metadata.name,
      functionTriggerMetadata: triggerOptions.metadata,
      functionMetadata: {
        functionName,
        ...functionOptions,
      },
    });
  }
}

function createFunctionName(target, functionName) {
  return getProviderName(target).replace(/[:#]/g, '-') + '-' + functionName;
}
