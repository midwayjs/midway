import { EggRouter as Router } from '@eggjs/router';
import { CONTROLLER_KEY, MIDDLEWARE_KEY, PRIORITY_KEY, WEB_ROUTER_KEY } from '@midwayjs/decorator';
import { getClassMetaData, getMethodDataFromClass, listModule, TagClsMetadata, TAGGED_CLS } from 'injection';
import { MidwayLoader } from 'midway-core';
import 'reflect-metadata';
import { WebMiddleware } from '../interface';

interface MappingInfo {
  path: string;
  requestMethod: string;
  routerName: string;
  priority?: number;
  method: string;
}

// const debug = require('debug')('midway:web-loader');

export class MidwayWebLoader extends MidwayLoader {
  private prioritySortRouters: Array<{
    priority: number,
    router: Router,
  }> = [];

  protected async loadMidwayController(): Promise<void> {
    const controllerModules = listModule(CONTROLLER_KEY);

    for (const module in controllerModules) {
      const metaData = Reflect.getMetadata(TAGGED_CLS, module) as TagClsMetadata;
      if (metaData && metaData.id) {
        await this.preRegisterRouter(module, metaData.id);
      }
    }

    // must sort by priority
    if (this.prioritySortRouters.length) {
      this.prioritySortRouters = this.prioritySortRouters.sort((routerA, routerB) => {
        return routerB.priority - routerA.priority;
      });

      this.prioritySortRouters.forEach((prioritySortRouter) => {
        this.app.use(prioritySortRouter.router.middleware());
      });
    }
  }

  /**
   * 从xml加载controller
   */
  protected async preloadControllerFromXml(): Promise<void> {
    const ids = this.applicationContext.controllersIds;
    if (Array.isArray(ids) && ids.length > 0) {
      for (const id of ids) {
        const controllers = await this.applicationContext.getAsync(id);
        const app = this.app;
        if (Array.isArray(controllers.list)) {
          controllers.list.forEach(c => {
            const newRouter = new Router({
              sensitive: true,
            }, app);
            c.expose(newRouter);

            app.use(newRouter.middleware());
          });
        }
      }
    }
  }

  protected async preRegisterRouter(target, controllerId) {
    const app = this.app;
    const controllerPrefix = getClassMetaData(CONTROLLER_KEY, target);
    let newRouter;
    if (controllerPrefix) {
      newRouter = new Router({
        sensitive: true,
      }, app);
      newRouter.prefix(controllerPrefix);
      // get middleware
      const middlewares = getClassMetaData(MIDDLEWARE_KEY, target);
      if (middlewares && middlewares.length) {
        for (const middleware of middlewares) {
          const middlewareCls: WebMiddleware = await this.applicationContext.getAsync(middleware);
          newRouter.use(middlewareCls.resolve());
        }
      }

      const webRouterInfo: MappingInfo[] = getClassMetaData(WEB_ROUTER_KEY, target);
      if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
        for (const webRouter of webRouterInfo) {
          // get middleware
          const middlewares = getMethodDataFromClass(MIDDLEWARE_KEY, target, webRouter.method);
          const methodMiddlwares = [];
          if (middlewares && middlewares.length) {
            for (const middleware of middlewares) {
              const middlewareCls: WebMiddleware = await this.applicationContext.getAsync(middleware);
              methodMiddlwares.push(middlewareCls.resolve());
            }
          }

          const routerArgs = [
            webRouter.routerName,
            webRouter.path,
            ...methodMiddlwares,
            this.generateController(`${controllerId}.${webRouter.method}`)
          ].concat(methodMiddlwares);

          // apply controller from request context
          newRouter[webRouter.requestMethod].apply(newRouter, routerArgs);
        }
      }
    }

    // sort for priority
    if (newRouter) {
      const priority = getClassMetaData(PRIORITY_KEY, target);
      this.prioritySortRouters.push({
        priority: priority || 0,
        router: newRouter,
      });
    }
  }

  /**
   * wrap controller string to middleware function
   * @param controllerMapping like xxxController.index
   */
  public generateController(controllerMapping: string) {
    const mappingSplit = controllerMapping.split('.');
    const controllerId = mappingSplit[0];
    const methodName = mappingSplit[1];
    return async (ctx, next) => {
      const controller = await ctx.requestContext.getAsync(controllerId);
      return controller[methodName].call(controller, ctx, next);
    };
  }

  public async refreshContext(): Promise<void> {
    await super.refreshContext();
    await this.preloadControllerFromXml();
  }
}
