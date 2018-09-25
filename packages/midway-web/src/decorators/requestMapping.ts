/**
 * 'HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE' 封装
 */
import 'reflect-metadata';
import { RequestMethod } from '../constants';
import { WEB_ROUTER_CLS, WEB_ROUTER_PROP } from './metaKeys';
import { attachMetaDataOnClass } from '../utils';

const PATH_METADATA = 'PATH_METADATA';
const METHOD_METADATA = 'METHOD_METADATA';
const ROUTER_NAME_METADATA = 'ROUTER_NAME_METADATA';

const defaultMetadata = {
  [PATH_METADATA]: '/',
  [METHOD_METADATA]: RequestMethod.GET,
  [ROUTER_NAME_METADATA]: null
};

export interface RequestMappingMetadata {
  [PATH_METADATA]?: string;
  [METHOD_METADATA]: string;
  [ROUTER_NAME_METADATA]?: string;
}

export const RequestMapping = (
  metadata: RequestMappingMetadata = defaultMetadata,
): MethodDecorator => {
  const path = metadata[PATH_METADATA] || '/';
  const requestMethod = metadata[METHOD_METADATA] || RequestMethod.GET;
  const routerName = metadata[ROUTER_NAME_METADATA];

  return (target, key, descriptor: PropertyDescriptor) => {
    // save method name on class
    attachMetaDataOnClass(target.constructor, WEB_ROUTER_CLS, key);
    let props = Reflect.getMetadata(WEB_ROUTER_PROP, target.constructor, key);
    if (!props) {
      props = [];
    }
    props.push({path, requestMethod, routerName});
    // save metadata on method
    Reflect.defineMetadata(WEB_ROUTER_PROP, props, target.constructor, key);
    return descriptor;
  };
};

const createMappingDecorator = (method: string) => (
  path?: string,
  routerName?: string,
): MethodDecorator => {
  return RequestMapping({
    [PATH_METADATA]: path,
    [METHOD_METADATA]: method,
    [ROUTER_NAME_METADATA]: routerName,
  });
};

/**
 * Routes HTTP POST requests to the specified path.
 */
export const post = createMappingDecorator(RequestMethod.POST);

/**
 * Routes HTTP GET requests to the specified path.
 */
export const get = createMappingDecorator(RequestMethod.GET);

/**
 * Routes HTTP DELETE requests to the specified path.
 */
export const del = createMappingDecorator(RequestMethod.DELETE);

/**
 * Routes HTTP PUT requests to the specified path.
 */
export const put = createMappingDecorator(RequestMethod.PUT);

/**
 * Routes HTTP PATCH requests to the specified path.
 */
export const patch = createMappingDecorator(RequestMethod.PATCH);

/**
 * Routes HTTP OPTIONS requests to the specified path.
 */
export const options = createMappingDecorator(RequestMethod.OPTIONS);

/**
 * Routes HTTP HEAD requests to the specified path.
 */
export const head = createMappingDecorator(RequestMethod.HEAD);

/**
 * Routes all HTTP requests to the specified path.
 */
export const all = createMappingDecorator(RequestMethod.ALL);
