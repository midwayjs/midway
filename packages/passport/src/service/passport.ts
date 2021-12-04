import * as passport from 'passport';
import { App, Config, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { getPassport, isExpressMode } from '../util';
import { AbstractPassportMiddleware, AbstractStrategy } from '../interface';

export function PassportStrategy(
  Strategy: new (...args) => passport.Strategy,
  name?: string
): new (...args) => AbstractStrategy {
  abstract class InnerStrategyAbstractClass extends AbstractStrategy {

    strategy;

    async initStrategy() {
      const cb = async (...params: any[]) => {
        const done = params[params.length - 1];
        try {
          const result = await this.validate(...params);
          if (Array.isArray(result)) {
            done(null, ...result);
          } else {
            done(null, result);
          }
        } catch (err) {
          done(err, null);
        }
      };

      this.strategy = new Strategy(this.getStrategyConfig(), cb);

      const passport = getPassport() as passport.PassportStatic;
      if (name) {
        passport.use(name, this.strategy);
      } else {
        passport.use('default', this.strategy);
      }
      if (this['serializeUser']) {
        passport.serializeUser(this['serializeUser']);
      }

      if (this['deserializeUser']) {
        passport.deserializeUser(this['deserializeUser']);
      }

      if (this['transformAuthInfo']) {
        passport.transformAuthInfo(this['transformAuthInfo']);
      }
    }
    getStrategy() {
      return this.strategy;
    }
  }
  return InnerStrategyAbstractClass as any;
}

export function PassportMiddleware(type: (new (...args) => AbstractStrategy)): new (...args) => AbstractPassportMiddleware {
  abstract class InnerPassportMiddleware extends AbstractPassportMiddleware {

    @Inject()
    passportService: PassportService;

    authenticate(options: passport.AuthenticateOptions) {
      return this.passportService.authenticate(type, options);
    }

    resolve() {
      this.passportService.initMiddleware();
      if (isExpressMode()) {
        return async (req, res, next) => {
          return this.authenticate(await this.getAuthenticateOptions())(req, res, next);
        }
      } else {
        return async (ctx, next) => {
          return this.authenticate(await this.getAuthenticateOptions())(ctx, next);
        }
      }
    }

    getAuthenticateOptions(): Promise<passport.AuthenticateOptions> | passport.AuthenticateOptions {
      return undefined;
    }
  }
  return InnerPassportMiddleware as any;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class PassportService {
  @Config('passport')
  passportConfig;

  @App()
  app;

  inited = false;

  initMiddleware() {
    if (!this.inited) {
      this.inited = true;
      const passport = getPassport();
      this.app.use(passport.initialize());
      if (this.passportConfig.session) {
        this.app.use(passport.session());
      }
    }
  }

  authenticate(strategy: (new (...args) => AbstractStrategy), options: passport.AuthenticateOptions): any {
    if (isExpressMode()) {
      return async (req, res, next) => {
        // merge options with default options
        const authOptions = {
          ...this.passportConfig,
          ...options,
        };

        if (authOptions.session && req.session[authOptions.property]) {
          req[authOptions.property] = req.session[authOptions.property];
        }
        // ignore user has exists
        if (req[authOptions.property]) {
          next();
        } else {
          const passport = getPassport() as passport.PassportStatic;
          // got strategy
          let strategyInstance = await this.app.getApplicationContext().getAsync(strategy);
          await (strategyInstance as any).initStrategy();
          const user = await new Promise<any>((resolve, reject) => {
            // authenticate
            passport.authenticate((strategyInstance as any).getStrategy(), authOptions, (err, user, info, status) => {
              if (err) {
                reject(err);
              } else {
                resolve(user);
              }
            })(req, res, (err) => (err ? reject(err) : resolve(0)));
          });
          if (user)  {
            req[authOptions.property] = user;
            if (authOptions.session) {
              req.logIn(user, options, next);
              return;
            }
          } else {
            if (options.failureRedirect) {
              res.redirect(options.failureRedirect);
              return;
            } else {
              res.status(401);
            }
          }
          next();
        }
      }
    } else {
      return async (ctx, next) => {
        // merge options with default options
        const authOptions = {
          ...this.passportConfig,
          ...options,
        };

        if (authOptions.session && ctx.session.passport && ctx.session.passport[authOptions.property]) {
          ctx.state[authOptions.property] = ctx.session.passport[authOptions.property];
        }
        // ignore user has exists
        if (ctx.state[authOptions.property]) {
          await next();
        } else {
          const passport = getPassport() as passport.PassportStatic;
          // got strategy
          let strategyInstance = await this.app.getApplicationContext().getAsync(strategy);
          await (strategyInstance as any).initStrategy();
          try {
            const user = await new Promise<any>((resolve, reject) => {
              // authenticate
              passport.authenticate((strategyInstance as any).getStrategy(), authOptions, (err, user, info, status) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(user);
                }
              })(ctx, (err) => (err ? reject(err) : resolve(0)));
            });
            if (user) {
              ctx.state[authOptions.property] = user;
              if (authOptions.session) {
                // save to ctx.session.passport
                await ctx.login(user, options);
              }
              if (options.successRedirect) {
                ctx.redirect(options.successRedirect);
                return;
              }
            } else {
              if (options.failureRedirect) {
                ctx.redirect(options.failureRedirect);
                return;
              } else {
                ctx.status = 401;
              }
            }
            await next();
          } catch (err) {
            ctx.throw(err);
          }
        }
      }
    }
  }
}
