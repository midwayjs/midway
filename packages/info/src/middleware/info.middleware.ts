import {
  Config,
  Inject,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { InfoService } from '../infoService';

@Middleware()
export class InfoMiddleware {
  @Config('info.infoPath')
  protected infoPath;

  @Inject()
  protected infoService: InfoService;

  resolve(app) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        if (req.path === this.infoPath) {
          // return html
          res.type('html');
          res.send(this.infoService.info('html'));
        } else {
          next();
        }
      };
    } else {
      return async (ctx, next) => {
        if (ctx.path === this.infoPath) {
          // return html
          return this.infoService.info('html');
        }
        return await next();
      };
    }
  }

  static getName() {
    return 'info';
  }
}
