import { Router } from './router';
import {getMethodNames} from './utils';

const debug = require('debug')('midway:controller');

class Route {
  method: string;
  pattern: string;
  fn;

  constructor(method: string, pattern: string, fn) {
    this.method = method;
    this.pattern = pattern;
    this.fn = fn;
  }
}

export class BaseController {
  routes: Array<Route> = [];

  constructor() {
    this.init();
  }

  init() {

  }

  route(method: string, pattern: string, fn) {
    this.routes.push(new Route(method, pattern, fn));
  }

  expose(router: Router) {
    const methodNames = getMethodNames(this);
    if (methodNames.length > 0) {
      methodNames.forEach(name => {
        // see decorators/babel.ts
        const fn = this[name];
        const route = fn.route;
        if (typeof fn === 'function' && route && route.method && route.pattern) {
          debug(`register ${route.method} - ${route.pattern}`);
          router[fn.route.method].call(router, route.method + route.pattern, route.pattern, fn.bind(this));
        }
      });
    }

    if (this.routes.length > 0) {
      this.routes.forEach(r => {
        debug(`register ${r.method} - ${r.pattern}`);
        router[r.method].call(router, r.method + r.pattern, r.pattern, r.fn.bind(this));
      });
    }
  }
}