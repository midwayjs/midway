import { Middleware, Config, MidwayFrameworkType } from '@midwayjs/core';
import { toHTML } from './html';
import { CodeDyeOptions } from './interface';
import { asyncRunWrapper } from './reqInfo';

@Middleware()
export class CodeDyeMW {
  @Config('codeDye')
  codeDye: CodeDyeOptions;

  resolve(app) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        return this.compatibleMiddleware(req, res, next);
      };
    } else {
      return async (ctx, next) => {
        return this.compatibleMiddleware(ctx.request, ctx, next);
      };
    }
  }

  check(request) {
    let outputType;
    if (
      this.codeDye.matchQueryKey &&
      request.query[this.codeDye.matchQueryKey]
    ) {
      outputType = request.query[this.codeDye.matchQueryKey];
    } else if (
      this.codeDye.matchHeaderKey &&
      request.headers[this.codeDye.matchHeaderKey]
    ) {
      outputType = request.headers[this.codeDye.matchQueryKey];
    }
    if (!outputType) {
      return false;
    }
    return outputType;
  }

  async compatibleMiddleware(request, response, next) {
    const reqInfo = {
      call: [],
    };
    const outputType = this.check(request);
    if (!outputType) {
      return next();
    }
    return asyncRunWrapper(this.codeDye, reqInfo, async () => {
      const res = await next();
      const reqInfoJSON = JSON.stringify(
        reqInfo,
        (key, value) => {
          if (key === 'codeDyeConfig' || key === 'codeDyeParent') {
            return;
          }
          return value;
        },
        0
      );
      if (outputType === 'log') {
        console.log(reqInfoJSON);
      } else if (outputType === 'html') {
        response.set('Content-Type', 'text/html');
        return toHTML(reqInfo.call);
      } else if (outputType === 'json') {
        return reqInfoJSON;
      }
      return res;
    });
  }
}
