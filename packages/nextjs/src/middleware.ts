import {
  Middleware,
  IMiddleware,
  NextFunction,
  Context,
  MidwayEnvironmentService,
  Inject,
  Init,
  MidwayWebRouterService,
  IMidwayApplication,
  MidwayServerlessFunctionService,
  Config,
} from '@midwayjs/core';
import next from 'next';
// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url';

@Middleware()
export class NextJSMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  env: MidwayEnvironmentService;
  protected handle;
  protected webRouterService:
    | MidwayWebRouterService
    | MidwayServerlessFunctionService;

  @Config('next')
  protected nextConfig;

  @Inject()
  appDir: string;

  @Init()
  async init() {
    const app = next({
      dev: this.env.isDevelopmentEnvironment(),
      dir: this.appDir,
      ...this.nextConfig,
    });
    this.handle = app.getRequestHandler();
    await app.prepare();
  }
  resolve(app: IMidwayApplication) {
    if (app.getNamespace() === 'faas') {
      this.webRouterService = app
        .getApplicationContext()
        .get(MidwayServerlessFunctionService);
    } else {
      this.webRouterService = app
        .getApplicationContext()
        .get(MidwayWebRouterService);
    }
    const nextHandler = async (req, res) => {
      const parsedUrl = parse(req.url, true);
      await this.handle(req, res, parsedUrl);
    };

    return async (ctx: Context, next: NextFunction) => {
      const routeInfo = await this.webRouterService.getMatchedRouterInfo(
        ctx['path'],
        ctx['method']
      );
      if (routeInfo) {
        return await next();
      } else {
        // 给个默认值
        ctx['res'].statusCode = 200;
        await nextHandler(ctx['req'] || ctx, ctx['res']);
      }
    };
  }

  static getName(): string {
    return 'nextjs';
  }
}
