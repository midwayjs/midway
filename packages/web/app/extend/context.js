'use strict';
const rc = Symbol('Context#RequestContext');
const ctxLogger = Symbol('Context#ContextLogger');
const {
  MidwayRequestContainer,
  MidwayWebRouterService,
  httpError,
} = require('@midwayjs/core');

module.exports = {
  get requestContext() {
    if (!this[rc]) {
      this[rc] = new MidwayRequestContainer(this, this.app.applicationContext);
      this[rc].ready();
    }
    return this[rc];
  },
  get startTime() {
    return this['starttime'];
  },

  getLogger(name) {
    return this.app.createContextLogger(this, name);
  },

  get logger() {
    if (this[ctxLogger]) {
      return this[ctxLogger];
    }
    return this.app.createContextLogger(this);
  },

  set logger(customLogger) {
    this[ctxLogger] = customLogger;
  },

  setAttr(key, value) {
    this.requestContext.setAttr(key, value);
  },

  getAttr(key) {
    return this.requestContext.getAttr(key);
  },

  async forward(url) {
    const routerService = this.requestContext.get(MidwayWebRouterService);
    const matchedUrlRouteInfo = await routerService.getMatchedRouterInfo(
      url,
      this.method
    );

    if (matchedUrlRouteInfo) {
      if (matchedUrlRouteInfo.controllerClz) {
        // normal class controller router
        const controllerInstance = await this.requestContext.getAsync(
          matchedUrlRouteInfo.controllerClz
        );
        return controllerInstance[matchedUrlRouteInfo.method](this);
      } else if (typeof matchedUrlRouteInfo.method === 'function') {
        // dynamic router
        return matchedUrlRouteInfo.method(this);
      }
    } else {
      throw new httpError.NotFoundError(`Forward url ${url} Not Found`);
    }
  },
};
