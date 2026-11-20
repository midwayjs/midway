import {
  IMiddleware,
  IMidwayApplication,
  IMidwayContext,
  NextFunction,
  Config,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { extname } from 'path';
import { MidwayAdapter } from './adapter';
import { BullBoardOption } from './interface';
import { BullBoardManager } from './board.manager';

const MIME_MAP = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'application/x-font-ttf',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/x-font-opentype',
};

@Provide()
@Scope(ScopeEnum.Singleton)
export class BoardMiddleware implements IMiddleware<
  IMidwayContext,
  NextFunction,
  unknown
> {
  @Config('bullBoard')
  protected bullBoardConfig: BullBoardOption;

  @Inject()
  protected bullBoardManager: BullBoardManager;

  private basePath: string;
  private serverAdapter: MidwayAdapter;

  /**
   * Normalize a route prefix with a leading slash and no trailing slashes, preserving root "/".
   */
  private normalizePrefix(prefix: string): string {
    const withLeadingSlash = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const normalized = withLeadingSlash.replace(/\/+$/, '');
    return normalized || '/';
  }

  /**
   * Extract the relative bull-board route path only when pathname strictly matches basePath boundary.
   */
  private extractRoutePath(pathname: string): string | null {
    if (!this.basePath || !this.serverAdapter || typeof pathname !== 'string') {
      return null;
    }
    const base = this.normalizePrefix(this.basePath);
    if (base === '/') {
      return pathname || '/';
    }
    if (pathname === base) {
      return '/';
    }
    if (pathname.startsWith(`${base}/`)) {
      return pathname.slice(base.length);
    }
    return null;
  }

  /**
   * Check whether a routePath points under the configured static route directory.
   */
  private isStaticRoute(routePath: string): boolean {
    const staticRoute = this.serverAdapter?.getStaticRoutes();
    if (!staticRoute) {
      return false;
    }
    const staticPrefix = this.normalizePrefix(staticRoute);
    if (staticPrefix === '/') {
      return routePath.startsWith('/');
    }
    return routePath.startsWith(`${staticPrefix}/`);
  }

  resolve(app: IMidwayApplication) {
    this.basePath = this.bullBoardManager.getBasePath();
    this.serverAdapter = this.bullBoardManager.getServerAdapter();

    if ('express' === app.getNamespace()) {
      return async (req: any, res: any, next: NextFunction) => {
        const pathname = req.path;
        const routePath = this.extractRoutePath(pathname);
        if (routePath === null) {
          return next();
        }

        let content;
        let matched = false;
        if (this.isStaticRoute(routePath)) {
          matched = true;
          content = await this.serverAdapter.renderStatic(routePath);
        } else if (
          this.serverAdapter.getViewRoutes().indexOf(routePath) !== -1
        ) {
          matched = true;
          const entryRoute = this.serverAdapter.getEntryRoute();
          const { name, params } = entryRoute.handler({
            basePath: this.basePath,
            uiConfig: this.bullBoardConfig.uiConfig,
          });
          content = await this.serverAdapter.renderView(name, params);
        } else {
          const matchRoute = this.serverAdapter.matchApiRoutes(
            req.method,
            routePath
          );
          if (matchRoute) {
            matched = true;
            content = await this.serverAdapter.runAPI(matchRoute, req.query);
          }
        }

        if (!matched) {
          return next();
        }

        const ext = extname(pathname);
        if (MIME_MAP[ext]) {
          res.type(MIME_MAP[ext]);
        } else {
          if (typeof content === 'object') {
            res.type('application/json');
          } else {
            res.type('text/html');
          }
        }

        res.send(content);
      };
    } else {
      return async (ctx: IMidwayContext, next: NextFunction) => {
        const pathname = (ctx as any).path;
        const routePath = this.extractRoutePath(pathname);
        if (routePath === null) {
          return next();
        }

        let content;
        let matched = false;
        if (this.isStaticRoute(routePath)) {
          matched = true;
          content = await this.serverAdapter.renderStatic(routePath);
        } else if (
          this.serverAdapter.getViewRoutes().indexOf(routePath) !== -1
        ) {
          matched = true;
          const entryRoute = this.serverAdapter.getEntryRoute();
          const { name, params } = entryRoute.handler({
            basePath: this.basePath,
            uiConfig: this.bullBoardConfig.uiConfig,
          });
          content = await this.serverAdapter.renderView(name, params);
        } else {
          const matchRoute = this.serverAdapter.matchApiRoutes(
            (ctx as any).method,
            routePath
          );
          if (matchRoute) {
            matched = true;
            content = await this.serverAdapter.runAPI(
              matchRoute,
              (ctx as any).query
            );
          }
        }

        if (!matched) {
          return next();
        }

        const ext = extname(pathname);
        if (MIME_MAP[ext]) {
          (ctx as any).type = MIME_MAP[ext];
        } else {
          if (typeof content === 'object') {
            (ctx as any).type = 'application/json';
          } else {
            (ctx as any).type = 'text/html';
          }
        }

        (ctx as any).body = content;
      };
    }
  }

  static getName() {
    return 'bull-board-ui';
  }
}
