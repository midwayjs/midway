/**
 * for babeljs
 *
 * @author kurten
 *
 * @copyright(c) 2018-2019 Alibaba Group.
 */

import {RequestMethod} from '../constants';

function route(method: string, pattern: string) {
  return (target, key, descriptor: PropertyDescriptor) => {
    descriptor.value.route = {
      method: method,
      pattern: pattern
    };
    return descriptor;
  };
}

/**
 * Routes HTTP POST requests to the specified path.
 */
const post = route.bind(null, RequestMethod.POST);

/**
 * Routes HTTP GET requests to the specified path.
 */
const get = route.bind(null, RequestMethod.GET);

/**
 * Routes HTTP DELETE requests to the specified path.
 */
const del = route.bind(null, RequestMethod.DELETE);

/**
 * Routes HTTP PUT requests to the specified path.
 */
const put = route.bind(null, RequestMethod.PUT);

/**
 * Routes HTTP PATCH requests to the specified path.
 */
const patch = route.bind(null, RequestMethod.PATCH);

/**
 * Routes HTTP OPTIONS requests to the specified path.
 */
const options = route.bind(null, RequestMethod.OPTIONS);

/**
 * Routes HTTP HEAD requests to the specified path.
 */
const head = route.bind(null, RequestMethod.HEAD);

/**
 * Routes all HTTP requests to the specified path.
 */
const all = route.bind(null, RequestMethod.ALL);

export const babel = {
  route,
  post,
  get,
  del,
  put,
  patch,
  options,
  head,
  all
};