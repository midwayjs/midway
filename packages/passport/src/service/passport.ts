import * as passport from 'passport';
import { App, Config, Init } from '@midwayjs/decorator';
import { getPassport, isExpressMode } from '../util';
import { AbstractPassportMiddleware, AbstractStrategy } from '../interface';

export function PassportStrategy(
  Strategy: new (...args) => passport.Strategy,
  name?: string
): new (...args) => AbstractStrategy {
  abstract class InnerStrategyAbstractClass extends AbstractStrategy {
    private strategy;

    @Init()
    async init() {
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

      this.strategy = new Strategy(this.getStrategyOptions(), cb);

      const passport = getPassport() as passport.PassportStatic;
      if (name) {
        passport.use(name, this.strategy);
      } else {
        passport.use(this.strategy);
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

export type StrategyClass = new (...args) => AbstractStrategy;

export function PassportMiddleware(
  strategy: StrategyClass | StrategyClass[]
): new (...args) => AbstractPassportMiddleware {
  abstract class InnerPassportMiddleware extends AbstractPassportMiddleware {
    @Config('passport')
    passportConfig;

    @App()
    app;

    resolve() {
      if (isExpressMode()) {
        return async function passportMiddleware(req, res, next) {
          return this.authenticate(await this.getAuthenticateOptions())(
            req,
            res,
            next
          );
        }.bind(this);
      } else {
        return async function passportMiddleware(ctx, next) {
          return this.authenticate(await this.getAuthenticateOptions())(
            ctx,
            next
          );
        }.bind(this);
      }
    }

    getAuthenticateOptions():
      | Promise<passport.AuthenticateOptions>
      | passport.AuthenticateOptions {
      return undefined;
    }

    authenticate(options: passport.AuthenticateOptions): any {
      if (!Array.isArray(strategy)) {
        strategy = [strategy];
      }

      if (isExpressMode()) {
        return async (req, res, next) => {
          // merge options with default options
          const authOptions = {
            ...this.passportConfig,
            ...options,
          };

          if (authOptions.session && req.session[authOptions.userProperty]) {
            req[authOptions.userProperty] =
              req.session[authOptions.userProperty];
          }
          // ignore user has exists
          if (req[authOptions.userProperty]) {
            next();
          } else {
            const passport = getPassport() as passport.PassportStatic;
            const strategyList = [];
            for (const strategySingle of strategy as StrategyClass[]) {
              // got strategy
              const strategyInstance = await this.app
                .getApplicationContext()
                .getAsync(strategySingle);
              strategyList.push(strategyInstance.getStrategy());
            }

            const user = await new Promise<any>((resolve, reject) => {
              // authenticate
              passport.authenticate(
                strategyList,
                authOptions,
                (err, user, info, status) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(user);
                  }
                }
              )(req, res, err => (err ? reject(err) : resolve(0)));
            });
            if (user) {
              req[authOptions.userProperty] = user;
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
        };
      } else {
        return async function bbb(ctx, next) {
          // merge options with default options
          const authOptions = {
            ...this.passportConfig,
            ...options,
          };

          if (
            authOptions.session &&
            ctx.session.passport &&
            ctx.session.passport[authOptions.userProperty]
          ) {
            ctx.state[authOptions.userProperty] =
              ctx.session.passport[authOptions.userProperty];
          }
          // ignore user has exists
          if (ctx.state[authOptions.userProperty]) {
            await next();
          } else {
            const passport = getPassport() as passport.PassportStatic;
            const strategyList = [];
            for (const strategySingle of strategy as StrategyClass[]) {
              // got strategy
              const strategyInstance = await this.app
                .getApplicationContext()
                .getAsync(strategySingle);
              strategyList.push(strategyInstance.getStrategy());
            }
            try {
              const user = await new Promise<any>((resolve, reject) => {
                // authenticate
                passport.authenticate(
                  strategyList,
                  authOptions,
                  (err, user, info, status) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(user);
                    }
                  }
                )(ctx, err => (err ? reject(err) : resolve(0)));
              });
              if (user) {
                ctx.state[authOptions.userProperty] = user;
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
        }.bind(this);
      }
    }
  }
  return InnerPassportMiddleware as any;
}
