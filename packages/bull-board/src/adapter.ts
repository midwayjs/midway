import {
  AppControllerRoute,
  AppViewRoute,
  BullBoardQueues,
  ControllerHandlerReturnType,
  IServerAdapter,
} from '@bull-board/api/dist/typings/app';
import * as ejs from 'ejs';
import { join } from 'path';
import { readFileSync } from 'fs';
import { PathToRegexpUtil } from '@midwayjs/core';

export class MidwayAdapter implements IServerAdapter {
  private basePath = '';
  private bullBoardQueues: BullBoardQueues | undefined;
  // private errorHandler: ((error: Error) => ControllerHandlerReturnType) | undefined;
  private statics: { path: string; route: string } | undefined;
  private viewPath: string | undefined;
  private entryRoute: AppViewRoute | undefined;
  private apiRoutes: AppControllerRoute[] | undefined;
  private staticCache = new Map();

  public setBasePath(path: string): MidwayAdapter {
    this.basePath = path;
    return this;
  }

  public setStaticPath(
    staticsRoute: string,
    staticsPath: string
  ): MidwayAdapter {
    this.statics = { route: staticsRoute, path: staticsPath };

    return this;
  }

  public setViewsPath(viewPath: string): MidwayAdapter {
    this.viewPath = viewPath;
    return this;
  }

  public setErrorHandler(
    handler: (error: Error) => ControllerHandlerReturnType
  ) {
    // this.errorHandler = handler;
    return this;
  }

  public setApiRoutes(routes: AppControllerRoute[]): MidwayAdapter {
    this.apiRoutes = routes;

    this.apiRoutes.forEach(route => {
      (route as any).regexpPattern = PathToRegexpUtil.toRegexp(route.route);
    });

    return this;
  }

  public setEntryRoute(routeDef: AppViewRoute): MidwayAdapter {
    this.entryRoute = routeDef;

    return this;
  }

  public setQueues(bullBoardQueues: BullBoardQueues): MidwayAdapter {
    this.bullBoardQueues = bullBoardQueues;
    return this;
  }

  public getViewRoutes() {
    const { route } = this.entryRoute;
    return Array.isArray(route) ? route : [route];
  }

  public matchApiRoutes(method: string, url: string): AppControllerRoute {
    return this.apiRoutes.find(route => {
      if (route.method !== method.toLowerCase()) {
        return false;
      }
      const result = PathToRegexpUtil.match(route.route, {
        decode: decodeURIComponent,
      })(url);
      if (result) {
        (route as any).params = result.params;
      }
      return !!result;
    });
  }

  public getStaticRoutes() {
    return this.statics.route;
  }

  public async renderStatic(filename) {
    filename = filename.replace(this.statics.route, '');
    filename = join(this.statics.path, filename);
    if (this.staticCache.has(filename)) {
      return this.staticCache.get(filename);
    }

    const content = readFileSync(filename, {
      encoding: 'utf-8',
    });

    this.staticCache.set(filename, content);
    return content;
  }

  public async renderView(filename) {
    const basePath = this.basePath.endsWith('/')
      ? this.basePath
      : `${this.basePath}/`;
    if (filename === '/') {
      filename = 'index.ejs';
    }
    filename = join(this.viewPath, filename);
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        filename,
        { basePath, cache: true },
        {
          root: this.viewPath,
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  public async runAPI(route, query) {
    const response = await route.handler({
      queues: this.bullBoardQueues as any,
      params: route.params,
      query,
    });

    return response.body;
  }
}
