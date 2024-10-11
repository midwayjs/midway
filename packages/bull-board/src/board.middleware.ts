import {
  IMiddleware,
  IMidwayApplication,
  IMidwayContext,
  NextFunction,
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { extname } from 'path';
import * as bull from '@midwayjs/bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
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
export class BoardMiddleware
  implements IMiddleware<IMidwayContext, NextFunction, unknown>
{
  @Inject()
  protected framework: bull.Framework;

  @Config('bullBoard')
  protected bullBoardConfig: BullBoardOption;

  @Inject()
  protected bullBoardManager: BullBoardManager;

  private basePath: string;
  private serverAdapter: MidwayAdapter;

  @Init()
  protected async init() {
    const queueList = this.framework.getQueueList();
    const wrapQueues = queueList.map(queue => new BullAdapter(queue));
    this.basePath = this.bullBoardConfig.basePath;

    this.serverAdapter = new MidwayAdapter();
    const bullBoard = createBullBoard({
      queues: wrapQueues,
      serverAdapter: this.serverAdapter,
      options: {
        uiConfig: this.bullBoardConfig.uiConfig,
      },
    });
    this.serverAdapter.setBasePath(this.basePath);
    this.bullBoardManager.setBullBoard(bullBoard);
  }

  resolve(app: IMidwayApplication) {
    if ('express' === app.getNamespace()) {
      return async (req: any, res: any, next: NextFunction) => {
        const pathname = req.path;
        if (pathname.indexOf(this.basePath) === -1) {
          return next();
        }
        const routePath: string = pathname.replace(this.basePath, '') || '/';

        let content;
        if (routePath.startsWith(this.serverAdapter.getStaticRoutes())) {
          content = await this.serverAdapter.renderStatic(routePath);
        } else if (
          this.serverAdapter.getViewRoutes().indexOf(routePath) !== -1
        ) {
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
            content = await this.serverAdapter.runAPI(matchRoute, req.query);
          }
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
        if (pathname.indexOf(this.basePath) === -1) {
          return next();
        }

        const routePath: string = pathname.replace(this.basePath, '') || '/';

        let content;
        if (routePath.startsWith(this.serverAdapter.getStaticRoutes())) {
          content = await this.serverAdapter.renderStatic(routePath);
        } else if (
          this.serverAdapter.getViewRoutes().indexOf(routePath) !== -1
        ) {
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
            content = await this.serverAdapter.runAPI(
              matchRoute,
              (ctx as any).query
            );
          }
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
