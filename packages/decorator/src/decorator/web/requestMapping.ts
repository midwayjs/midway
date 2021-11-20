/**
 * 'HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE' 封装
 */
import { attachClassMetadata, WEB_ROUTER_KEY } from '../../';
import { MiddlewareParamArray } from '../../interface';

export interface RouterOption {
  /**
   * router path, like "/api"
   */
  path?: string | RegExp;
  /**
   * http method, like "get", "post"
   */
  requestMethod: string;
  /**
   * router alias name
   */
  routerName?: string;
  /**
   * which method decorator attached
   */
  method?: string;
  /**
   * middleware array in router
   */
  middleware?: MiddlewareParamArray;
  /**
   * router summary, for swagger
   */
  summary?: string;
  /**
   * router description, for swagger
   */
  description?: string;
  /**
   * ignore global prefix
   */
  ignoreGlobalPrefix?: boolean;
}

export const RequestMethod = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
  ALL: 'all',
  OPTIONS: 'options',
  HEAD: 'head',
};

const defaultMetadata = {
  path: '/',
  requestMethod: RequestMethod.GET,
  routerName: null,
  middleware: [],
};

export const RequestMapping = (
  metadata: RouterOption = defaultMetadata
): MethodDecorator => {
  const path = metadata.path || '/';
  const requestMethod = metadata.requestMethod || RequestMethod.GET;
  const routerName = metadata.routerName;
  const middleware = metadata.middleware;

  return (target, key, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      WEB_ROUTER_KEY,
      {
        path,
        requestMethod,
        routerName,
        method: key,
        middleware,
        summary: metadata?.summary || '',
        description: metadata?.description || '',
        ignoreGlobalPrefix: metadata?.ignoreGlobalPrefix ?? false,
      } as RouterOption,
      target
    );

    return descriptor;
  };
};

const createMappingDecorator =
  (method: string) =>
  (
    path?: string | RegExp,
    routerOptions: {
      routerName?: string;
      middleware?: MiddlewareParamArray;
      summary?: string;
      description?: string;
      ignoreGlobalPrefix?: boolean;
    } = { middleware: [] }
  ): MethodDecorator => {
    return RequestMapping(
      Object.assign(routerOptions, {
        requestMethod: method,
        path,
      })
    );
  };

/**
 * Routes HTTP POST requests to the specified path.
 */
export const Post = createMappingDecorator(RequestMethod.POST);

/**
 * Routes HTTP GET requests to the specified path.
 */
export const Get = createMappingDecorator(RequestMethod.GET);

/**
 * Routes HTTP DELETE requests to the specified path.
 */
export const Del = createMappingDecorator(RequestMethod.DELETE);

/**
 * Routes HTTP PUT requests to the specified path.
 */
export const Put = createMappingDecorator(RequestMethod.PUT);

/**
 * Routes HTTP PATCH requests to the specified path.
 */
export const Patch = createMappingDecorator(RequestMethod.PATCH);

/**
 * Routes HTTP OPTIONS requests to the specified path.
 */
export const Options = createMappingDecorator(RequestMethod.OPTIONS);

/**
 * Routes HTTP HEAD requests to the specified path.
 */
export const Head = createMappingDecorator(RequestMethod.HEAD);

/**
 * Routes all HTTP requests to the specified path.
 */
export const All = createMappingDecorator(RequestMethod.ALL);
