import type {
  AppControllerRoute,
  AppViewRoute,
  BullBoardQueues,
  ControllerHandlerReturnType,
  IServerAdapter,
  UIConfig,
} from '@bull-board/api/dist/typings/app';
import * as ejs from 'ejs';
import { isAbsolute, relative, resolve, sep } from 'path';
import { readFileSync, realpathSync, statSync } from 'fs';
import { PathToRegexpUtil, httpError } from '@midwayjs/core';

export class MidwayAdapter implements IServerAdapter {
  private basePath = '';
  private bullBoardQueues: BullBoardQueues | undefined;
  // private errorHandler: ((error: Error) => ControllerHandlerReturnType) | undefined;
  private statics: { path: string; route: string } | undefined;
  private staticRealRoot: string | undefined;
  private viewPath: string | undefined;
  private viewRealRoot: string | undefined;
  private entryRoute: AppViewRoute | undefined;
  private apiRoutes: AppControllerRoute[] | undefined;
  private staticCache = new Map();

  public setBasePath(path: string): MidwayAdapter {
    this.basePath = path;
    return this;
  }

  public setUIConfig(config: UIConfig): MidwayAdapter {
    // 这里没用
    return this;
  }

  public setStaticPath(
    staticsRoute: string,
    staticsPath: string
  ): MidwayAdapter {
    this.statics = { route: staticsRoute, path: staticsPath };
    this.staticRealRoot = undefined;
    this.staticCache.clear();

    return this;
  }

  public setViewsPath(viewPath: string): MidwayAdapter {
    this.viewPath = viewPath;
    this.viewRealRoot = undefined;
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

  public getEntryRoute() {
    return this.entryRoute;
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

  /**
   * Check whether targetPath is strictly inside rootDir without crossing directory boundaries.
   */
  private isPathInsideRoot(rootDir: string, targetPath: string): boolean {
    const rel = relative(rootDir, targetPath);
    return Boolean(
      rel && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
    );
  }

  /**
   * Decode and resolve a relative request path within rootPath, rejecting traversal attempts.
   */
  private resolveSafeFilePath(
    rootPath: string,
    rawRelativePath: string,
    errorLabel = 'static file'
  ): string {
    if (typeof rawRelativePath !== 'string') {
      throw new httpError.BadRequestError(`Invalid ${errorLabel} path`);
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(rawRelativePath);
    } catch {
      throw new httpError.BadRequestError(`Invalid ${errorLabel} path`);
    }

    if (!decoded || decoded.includes('\0')) {
      throw new httpError.BadRequestError(`Invalid ${errorLabel} path`);
    }

    if (
      decoded.includes('\\') ||
      decoded.startsWith('/') ||
      isAbsolute(decoded) ||
      /^[a-zA-Z]:/.test(decoded)
    ) {
      throw new httpError.ForbiddenError(`Invalid ${errorLabel} path`);
    }

    if (decoded.split('/').includes('..')) {
      throw new httpError.ForbiddenError(`Invalid ${errorLabel} path`);
    }

    const rootDir = resolve(rootPath);
    const targetPath = resolve(rootDir, decoded);
    if (!this.isPathInsideRoot(rootDir, targetPath)) {
      throw new httpError.ForbiddenError(`Invalid ${errorLabel} path`);
    }

    return targetPath;
  }

  /**
   * Resolve symlinks for both root and target paths and ensure the target is a regular file inside root.
   */
  private verifyRealFilePath(
    rootPath: string,
    targetPath: string,
    cachedRealRoot: string | undefined,
    errorLabel = 'Static file'
  ): { realRoot: string; realTarget: string } {
    let realTarget: string;
    try {
      realTarget = realpathSync(targetPath);
    } catch (err: any) {
      if (err?.code === 'ENOENT' || err?.code === 'ENOTDIR') {
        throw new httpError.NotFoundError(`${errorLabel} not found`);
      }
      throw err;
    }

    let realRoot = cachedRealRoot;
    if (!realRoot) {
      try {
        realRoot = realpathSync(rootPath);
      } catch (err: any) {
        if (err?.code === 'ENOENT' || err?.code === 'ENOTDIR') {
          throw new httpError.NotFoundError(`${errorLabel} not found`);
        }
        throw err;
      }
    }

    if (!this.isPathInsideRoot(realRoot, realTarget)) {
      throw new httpError.ForbiddenError(
        `Invalid ${errorLabel.toLowerCase()} path`
      );
    }

    let stat;
    try {
      stat = statSync(realTarget);
    } catch (err: any) {
      if (err?.code === 'ENOENT' || err?.code === 'ENOTDIR') {
        throw new httpError.NotFoundError(`${errorLabel} not found`);
      }
      throw err;
    }

    if (!stat.isFile()) {
      throw new httpError.NotFoundError(`${errorLabel} not found`);
    }

    return { realRoot, realTarget };
  }

  public async renderStatic(filename: string) {
    if (!this.statics?.path || !this.statics?.route) {
      throw new httpError.NotFoundError('Static resource not configured');
    }
    if (typeof filename !== 'string') {
      throw new httpError.BadRequestError('Invalid static file path');
    }

    const staticPrefix = this.statics.route.replace(/\/+$/, '');
    if (filename === staticPrefix || filename === `${staticPrefix}/`) {
      throw new httpError.NotFoundError('Static file not found');
    }
    if (!filename.startsWith(`${staticPrefix}/`)) {
      throw new httpError.ForbiddenError('Invalid static file path');
    }

    const rawRelativePath = filename.slice(staticPrefix.length + 1);
    const targetPath = this.resolveSafeFilePath(
      this.statics.path,
      rawRelativePath,
      'static file'
    );

    if (this.staticCache.has(targetPath)) {
      return this.staticCache.get(targetPath);
    }

    const { realRoot, realTarget } = this.verifyRealFilePath(
      this.statics.path,
      targetPath,
      this.staticRealRoot,
      'Static file'
    );
    this.staticRealRoot = realRoot;

    const content = readFileSync(realTarget, {
      encoding: 'utf-8',
    });

    this.staticCache.set(targetPath, content);
    return content;
  }

  public async renderView(filename: string, params = {}) {
    if (!this.viewPath) {
      throw new httpError.NotFoundError('View path not configured');
    }
    if (typeof filename !== 'string') {
      throw new httpError.BadRequestError('Invalid view file path');
    }

    const basePath = this.basePath.endsWith('/')
      ? this.basePath
      : `${this.basePath}/`;
    if (filename === '/') {
      filename = 'index.ejs';
    }
    const targetPath = this.resolveSafeFilePath(
      this.viewPath,
      filename,
      'view file'
    );
    const { realRoot, realTarget } = this.verifyRealFilePath(
      this.viewPath,
      targetPath,
      this.viewRealRoot,
      'View file'
    );
    this.viewRealRoot = realRoot;

    return new Promise((resolvePromise, reject) => {
      ejs.renderFile(
        realTarget,
        { basePath, cache: true, ...params },
        {
          root: realRoot,
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolvePromise(result);
          }
        }
      );
    });
  }

  public async runAPI(route, query, body?) {
    const response = await route.handler({
      queues: this.bullBoardQueues as any,
      params: route.params,
      query,
      body,
    });

    return response.body;
  }
}
