import { IMiddleware, IMidwayApplication } from '@midwayjs/core';
import {
  Config,
  Match,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { I18N_ATTR_KEY, I18N_SAVE_KEY, I18nOptions } from './interface';
import { MidwayI18nService } from './i18nService';

@Match()
export class I18nFilter {
  @Config('i18n.resolver')
  resolverConfig: I18nOptions['resolver'];

  match(value, req, res) {
    const saveLocale = req.getAttr(I18N_SAVE_KEY);
    if (saveLocale) {
      const cookieOptions = {
        // make sure browser javascript can read the cookie
        httpOnly: false,
        maxAge: this.resolverConfig.cookieField.cookieMaxAge,
        signed: false,
        domain: this.resolverConfig.cookieField.cookieDomain,
      };
      res.cookie(
        this.resolverConfig.cookieField.fieldName,
        saveLocale,
        cookieOptions
      );
    }
    return value;
  }
}

@Middleware()
export class I18nMiddleware implements IMiddleware<any, any> {
  @Config('i18n.resolver')
  resolverConfig: I18nOptions['resolver'];

  @Config('i18n')
  i18nConfig: I18nOptions;

  resolve(app: IMidwayApplication) {
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      // add a filter for i18n cookie
      app.useFilter(I18nFilter);
      return async (req, res, next) => {
        // get request locale from query/header/cookie
        const requestLocale =
          req.query[this.resolverConfig.queryField] ||
          req.get(this.resolverConfig.headerField) ||
          req.cookies[this.resolverConfig.cookieField.fieldName];

        // set to current locale
        req.setAttr(I18N_ATTR_KEY, requestLocale);

        // auto write locale to cookie
        if (this.i18nConfig.writeCookie) {
          const i18nService = await req.requestContext.getAsync(
            MidwayI18nService
          );
          i18nService.saveRequestLocale(requestLocale);
        }
        return next();
      };
    } else {
      return async (ctx, next) => {
        // get request locale from query/header/cookie
        const requestLocale =
          ctx.query[this.resolverConfig.queryField] ||
          ctx.get(this.resolverConfig.headerField) ||
          ctx.cookies.get(this.resolverConfig.cookieField.fieldName, {
            signed: false,
          });

        // set to current locale
        ctx.setAttr(I18N_ATTR_KEY, requestLocale);

        // auto write locale to cookie
        if (this.i18nConfig.writeCookie) {
          const i18nService = await ctx.requestContext.getAsync(
            MidwayI18nService
          );
          i18nService.saveRequestLocale(requestLocale);
        }

        // run next middleware and controller
        await next();

        // get need save locale
        const saveLocale = ctx.getAttr(I18N_SAVE_KEY);
        if (saveLocale) {
          const cookieOptions = {
            // make sure browser javascript can read the cookie
            httpOnly: false,
            maxAge: this.resolverConfig.cookieField.cookieMaxAge,
            signed: false,
            domain: this.resolverConfig.cookieField.cookieDomain,
            overwrite: true,
          };
          ctx.cookies.set(
            this.resolverConfig.cookieField.fieldName,
            saveLocale,
            cookieOptions
          );
        }
      };
    }
  }
}
