import {
  IMiddleware,
  IMidwayApplication,
  Config,
  Match,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/core';
import { I18N_ATTR_KEY, I18nOptions } from './interface';
import { MidwayI18nService } from './i18nService';
import { formatLocale } from './utils';

@Match()
export class I18nFilter {
  @Config('i18n.resolver')
  resolverConfig: I18nOptions['resolver'];

  @Config('i18n')
  i18nConfig: I18nOptions;

  match(value, req, res) {
    const saveLocale = req.getAttr(I18N_ATTR_KEY);
    if (this.resolverConfig) {
      if (
        this.i18nConfig.writeCookie &&
        saveLocale &&
        this.resolverConfig.cookieField
      ) {
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
        const i18nService = await req.requestContext.getAsync(
          MidwayI18nService
        );

        let requestLocale;
        if (this.resolverConfig) {
          // get request locale from query/header/cookie
          requestLocale =
            req.query[this.resolverConfig.queryField] ||
            req.cookies[this.resolverConfig.cookieField.fieldName];

          if (!requestLocale) {
            // Accept-Language: zh-CN,zh;q=0.5
            // Accept-Language: zh-CN
            let languages = req.acceptsLanguages();
            if (languages) {
              if (Array.isArray(languages)) {
                if (languages[0] === '*') {
                  languages = languages.slice(1);
                }
                if (languages.length > 0) {
                  for (let i = 0; i < languages.length; i++) {
                    const lang = formatLocale(languages[i]);
                    if (i18nService.hasAvailableLocale(lang)) {
                      requestLocale = lang;
                      break;
                    }
                  }
                }
              } else {
                requestLocale = languages;
              }
            }
          }
        }

        if (requestLocale) {
          i18nService.saveRequestLocale(requestLocale);
        } else {
          i18nService.saveRequestLocale();
        }

        res.locals[this.i18nConfig.localsField] = (
          message: string,
          data: any
        ) => {
          return i18nService.translate(message, {
            args: data,
          });
        };

        return next();
      };
    } else {
      return async (ctx, next) => {
        if (this.resolverConfig) {
          // get request locale from query/header/cookie
          let requestLocale =
            ctx.query[this.resolverConfig.queryField] ||
            ctx.cookies.get(this.resolverConfig.cookieField.fieldName, {
              signed: false,
            });

          const i18nService = await ctx.requestContext.getAsync(
            MidwayI18nService
          );
          if (!requestLocale) {
            // Accept-Language: zh-CN,zh;q=0.5
            // Accept-Language: zh-CN
            let languages = ctx.acceptsLanguages();
            if (languages) {
              if (Array.isArray(languages)) {
                if (languages[0] === '*') {
                  languages = languages.slice(1);
                }
                if (languages.length > 0) {
                  for (let i = 0; i < languages.length; i++) {
                    const lang = formatLocale(languages[i]);
                    if (i18nService.hasAvailableLocale(lang)) {
                      requestLocale = lang;
                      break;
                    }
                  }
                }
              } else {
                requestLocale = languages;
              }
            }
          }
          // save current locale
          if (requestLocale) {
            i18nService.saveRequestLocale(requestLocale);
          } else {
            i18nService.saveRequestLocale();
          }

          if (ctx.locals) {
            ctx.locals[this.i18nConfig.localsField] = (
              message: string,
              data: any
            ) => {
              return i18nService.translate(message, {
                args: data,
              });
            };
          }
        }

        // run next middleware and controller
        await next();

        // get need save locale
        const saveLocale = ctx.getAttr(I18N_ATTR_KEY);

        if (this.resolverConfig) {
          if (
            this.i18nConfig.writeCookie &&
            saveLocale &&
            this.resolverConfig.cookieField
          ) {
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
        }
      };
    }
  }

  static getName() {
    return 'i18n';
  }
}
