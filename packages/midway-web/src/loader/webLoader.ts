import { EggRouter as Router } from '@eggjs/router';
import { CONTROLLER_KEY, RouterOption, PRIORITY_KEY, WEB_ROUTER_KEY, ControllerOption, WebMiddleware } from '@midwayjs/decorator';
import { getClassMetaData, listModule, TagClsMetadata, TAGGED_CLS } from 'injection';
import { MidwayLoader } from 'midway-core';
import 'reflect-metadata';

export class MidwayWebLoader extends MidwayLoader {
  private controllerIds: string[] = [];
  private prioritySortRouters: Array<{
    priority: number,
    router: Router,
  }> = [];

  protected async loadMidwayController(): Promise<void> {
    const controllerModules = listModule(CONTROLLER_KEY);

    // implement @controller
    for (const module of controllerModules) {
      const metaData = Reflect.getMetadata(TAGGED_CLS, module) as TagClsMetadata;
      if (metaData && metaData.id) {
        if (this.controllerIds.indexOf(metaData.id) > -1) {
          throw new Error(`controller identifier [${metaData.id}] is exists!`);
        }
        this.controllerIds.push(metaData.id);
        await this.preRegisterRouter(module, metaData.id);
      }
    }

    // implement @priority
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
    const controllerOption: ControllerOption = getClassMetaData(CONTROLLER_KEY, target);
    let newRouter;
    if (controllerOption.prefix) {
      newRouter = new Router({
        sensitive: true,
      }, app);
      newRouter.prefix(controllerOption.prefix);
      // implement @middleware
      const middlewares = controllerOption.routerOptions.middleware;
      if (middlewares && middlewares.length) {
        for (const middleware of middlewares) {
          const middlewareImpl: WebMiddleware = await this.applicationContext.getAsync(middleware);
          if (middlewareImpl && middlewareImpl.resolve) {
            newRouter.use(middlewareImpl.resolve());
          }
        }
      }

      // implement @get @post
      const webRouterInfo: RouterOption[] = getClassMetaData(WEB_ROUTER_KEY, target);
      if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
        for (const webRouter of webRouterInfo) {
          // get middleware
          const middlewares = webRouter.middleware;
          const methodMiddlwares = [];
          if (middlewares && middlewares.length) {
            for (const middleware of middlewares) {
              const middlewareImpl: WebMiddleware = await this.applicationContext.getAsync(middleware);
              if (middlewareImpl && middlewareImpl.resolve) {
                methodMiddlwares.push(middlewareImpl.resolve());
              }
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
