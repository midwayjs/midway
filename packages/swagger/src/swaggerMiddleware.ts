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
  MidwayFrameworkType,
  MidwayEnvironmentService,
  MidwayInvalidConfigPropertyError,
} from '@midwayjs/core';
import type { SwaggerOptions } from './interfaces';
import { SwaggerExplorer } from './swaggerExplorer';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SwaggerMiddleware
  implements IMiddleware<IMidwayContext, NextFunction, unknown>
{
  @Config('swagger')
  private swaggerConfig: SwaggerOptions;

  private swaggerRender: (
    pathname: string
  ) => Promise<{ ext: string; content: string }>;

  @Inject()
  private swaggerExplorer: SwaggerExplorer;

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Init()
  async init() {
    if (typeof this.swaggerConfig.swaggerUIRender !== 'function') {
      throw new MidwayInvalidConfigPropertyError('swagger.swaggerRender');
    }
    this.swaggerRender = this.swaggerConfig.swaggerUIRender(
      this.swaggerConfig,
      this.swaggerExplorer
    );
  }

  resolve(app: IMidwayApplication) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: NextFunction) => {
        const pathname = req.path;
        const renderResult = await this.swaggerRender(pathname);

        if (renderResult) {
          const { ext, content } = renderResult;
          if (ext === '.js') {
            res.type('application/javascript');
          } else if (ext === '.map') {
            res.type('application/json');
          } else if (ext === '.css') {
            res.type('text/css');
          } else if (ext === '.png') {
            res.type('image/png');
          }
          res.send(content);
        } else {
          return next();
        }
      };
    } else {
      return async (ctx: IMidwayContext, next: NextFunction) => {
        const pathname = (ctx as any).path;
        const renderResult = await this.swaggerRender(pathname);

        if (renderResult) {
          const { ext, content } = renderResult;
          if (ext === '.js') {
            (ctx as any).set('Content-Type', 'application/javascript');
          } else if (ext === '.map') {
            (ctx as any).set('Content-Type', 'application/json');
          } else if (ext === '.css') {
            (ctx as any).set('Content-Type', 'text/css');
          } else if (ext === '.png') {
            (ctx as any).set('Content-Type', 'image/png');
          }

          (ctx as any).body = content;
        } else {
          return next();
        }
      };
    }
  }

  static getName() {
    return 'swagger';
  }
}
