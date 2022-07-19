import { App, Config, Init, Inject } from '@midwayjs/decorator';
import {
  AbstractPassportMiddleware,
  AbstractStrategy,
  AuthenticateOptions,
} from '../interface';
import { httpError } from '@midwayjs/core';
import { PassportAuthenticator } from './authenticator';
import { Strategy } from './strategy';
import * as http from 'http';
import { create as createReqMock } from './request';

export function PassportStrategy(
  Strategy: new (...args) => Strategy,
  name?: string
): new (...args) => AbstractStrategy {
  abstract class InnerStrategyAbstractClass extends AbstractStrategy {
    private strategy;

    @Inject()
    passport: PassportAuthenticator;

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

      if (name) {
        this.passport.use(name, this.strategy);
      } else {
        this.passport.use(this.strategy);
      }
      if (this['serializeUser']) {
        this.passport.serializeUser(this['serializeUser']);
      }

      if (this['deserializeUser']) {
        this.passport.deserializeUser(this['deserializeUser']);
      }

      if (this['transformAuthInfo']) {
        this.passport.transformAuthInfo(this['transformAuthInfo']);
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

    @Inject()
    passport: PassportAuthenticator;

    resolve() {
      return this.authenticate(this.getAuthenticateOptions());
    }

    getAuthenticateOptions(): AuthenticateOptions {
      return undefined;
    }

    authenticate(options: AuthenticateOptions): any {
      if (!Array.isArray(strategy)) {
        strategy = [strategy];
      }

      if (this.passport.isExpressMode()) {
        return async function passportAuthenticate(req, res, next) {
          // init req method
          this.attachRequestMethod(req);

          // merge options with default options
          const authOptions = {
            ...this.passportConfig,
            ...options,
          };

          const strategyList = [];
          for (const strategySingle of strategy as StrategyClass[]) {
            // got strategy
            const strategyInstance = await this.app
              .getApplicationContext()
              .getAsync(strategySingle);
            strategyList.push(strategyInstance.getStrategy());
          }

          // authenticate
          const authenticate = this.passport.authenticate(
            strategyList,
            authOptions
          );

          const authenticateResult = await authenticate(req);

          // success
          if (authenticateResult.successResult) {
            const breakNext = await this.onceSucceed(
              options,
              authenticateResult.successResult.user,
              authenticateResult.successResult.info,
              req,
              res
            );
            if (breakNext) {
              return;
            }
          } else if (authenticateResult.redirectResult) {
            // redirect
            res.statusCode = authenticateResult.redirectResult.status || 302;
            res.setHeader('Location', authenticateResult.redirectResult.url);
            res.setHeader('Content-Length', '0');
            res.end();
            return;
          } else {
            this.allFailed(options, authenticateResult.failResult, req, res);
          }
          next();
        }.bind(this);
      } else {
        return async function passportAuthenticate(ctx, next) {
          // koa <-> connect compatibility:
          const userProperty = this.passport.getUserProperty();
          // create mock object for express' req object
          const req = createReqMock(ctx, userProperty);
          // init req method
          this.attachRequestMethod(req);

          // add Promise-based login method
          const login = req.login;
          ctx.login = ctx.logIn = function (user, options) {
            return new Promise<void>((resolve, reject) => {
              login.call(req, user, options, err => {
                if (err) reject(err);
                else resolve();
              });
            });
          };

          // add aliases for passport's request extensions to Koa's context
          ctx.logout = ctx.logOut = req.logout.bind(req);
          ctx.isAuthenticated = req.isAuthenticated.bind(req);
          ctx.isUnauthenticated = req.isUnauthenticated.bind(req);

          // merge options with default options
          const authOptions = {
            ...this.passportConfig,
            ...options,
          };

          const strategyList = [];
          for (const strategySingle of strategy as StrategyClass[]) {
            // got strategy
            const strategyInstance = await this.app
              .getApplicationContext()
              .getAsync(strategySingle);
            strategyList.push(strategyInstance.getStrategy());
          }

          // authenticate
          const authenticate = this.passport.authenticate(
            strategyList,
            authOptions
          );

          const authenticateResult = await authenticate(req);

          // success
          if (authenticateResult.successResult) {
            const breakNext = await this.onceSucceed(
              options,
              authenticateResult.successResult.user,
              authenticateResult.successResult.info,
              req,
              ctx
            );
            if (breakNext) {
              return;
            }
          } else if (authenticateResult.redirectResult) {
            // redirect
            ctx.status = authenticateResult.redirectResult.status || 302;
            ctx.set('Location', authenticateResult.redirectResult.url);
            ctx.set('Content-Length', '0');
            return;
          } else {
            this.allFailed(options, authenticateResult.failResult, req, ctx);
            return;
          }

          await next();
        }.bind(this);
      }
    }

    static getName() {
      return 'passport';
    }

    protected async onceSucceed(
      options,
      user,
      info,
      req,
      res
    ): Promise<boolean> {
      let msg;
      if (options.successFlash) {
        let flash: any = options.successFlash;
        if (typeof flash === 'string') {
          flash = { type: 'success', message: flash };
        }
        flash.type = flash.type || 'success';

        const type = flash.type || info.type || 'success';
        msg = flash.message || info.message || info;
        if (typeof msg === 'string') {
          req.flash(type, msg);
        }
      }
      if (options.successMessage) {
        msg = options.successMessage;
        if (typeof msg === 'boolean') {
          msg = info.message || info;
        }
        if (typeof msg === 'string') {
          req.session.messages = req.session.messages || [];
          req.session.messages.push(msg);
        }
      }
      if (options.assignProperty) {
        req[options.assignProperty] = user;
        return;
      }

      await req.logIn(user, options);

      if (options.authInfo !== false) {
        await new Promise<void>((resolve, reject) => {
          this.passport.transformAuthInfo(info, req, (err, tinfo) => {
            if (err) {
              reject(err);
            } else {
              req.authInfo = tinfo;
              resolve();
            }
          });
        });
      }
      if (options.successReturnToOrRedirect) {
        let url = options.successReturnToOrRedirect;
        if (req.session && req.session.returnTo) {
          url = req.session.returnTo;
          delete req.session.returnTo;
        }
        res.redirect(url);
        return true;
      }
      if (options.successRedirect) {
        res.redirect(options.successRedirect);
        return true;
      }
    }

    protected allFailed(
      options,
      failResult: { failures: Array<{ challenge: string; status: number }> },
      req,
      res
    ) {
      // Strategies are ordered by priority.  For the purpose of flashing a
      // message, the first failure will be displayed.
      let failure = failResult.failures[0] || ({} as any),
        challenge = failure?.challenge || {},
        msg;

      if (options.failureFlash) {
        let flash: any = options.failureFlash;
        if (typeof flash === 'string') {
          flash = { type: 'error', message: flash };
        }
        flash.type = flash.type || 'error';

        const type = flash.type || challenge.type || 'error';
        msg = flash.message || challenge.message || challenge;
        if (typeof msg === 'string') {
          // TODO
          req.flash(type, msg);
        }
      }
      if (options.failureMessage) {
        msg = options.failureMessage;
        if (typeof msg === 'boolean') {
          msg = challenge.message || challenge;
        }
        if (typeof msg === 'string') {
          // TODO
          req.session.messages = req.session.messages || [];
          req.session.messages.push(msg);
        }
      }
      if (options.failureRedirect) {
        // TODO
        return res.redirect(options.failureRedirect);
      }

      // When failure handling is not delegated to the application, the default
      // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
      // header will be set according to the strategies in use (see
      // actions#fail).  If multiple strategies failed, each of their challenges
      // will be included in the response.
      const rchallenge = [];
      let rstatus, status;

      for (let j = 0, len = failResult.failures.length; j < len; j++) {
        failure = failResult.failures[j];
        challenge = failure.challenge;
        status = failure.status;

        rstatus = rstatus || status;
        if (typeof challenge === 'string') {
          rchallenge.push(challenge);
        }
      }

      res.statusCode = rstatus || 401;
      // eslint-disable-next-line eqeqeq
      if (res.statusCode === 401 && rchallenge.length) {
        // TODO
        res.setHeader('WWW-Authenticate', rchallenge);
      }
      if (options.failWithError) {
        throw new httpError.UnauthorizedError();
      }
      // TODO
      res.end(http.STATUS_CODES[res.statusCode]);
    }

    protected attachRequestMethod(req) {
      // init req method
      req.login = req.logIn = (
        user,
        options?: {
          session?: boolean;
          keepSessionInfo?: boolean;
        },
        done?
      ) => {
        if (typeof options === 'function') {
          done = options;
          options = {};
        }
        options = options || {};

        const property = this.passport.getUserProperty();
        req[property] = user;
        if (this.passport.isEnableSession()) {
          return this.passport.logInToSession(req, user).catch(err => {
            req[property] = null;
            if (done) {
              done(err);
            } else {
              throw err;
            }
          });
        } else {
          return Promise.resolve().then(() => {
            if (done) {
              done();
            }
          });
        }
      };

      req.logout = req.logOut = (options, done?) => {
        if (typeof options === 'function') {
          done = options;
          options = {};
        }
        options = options || {};

        req[this.passport.getUserProperty()] = null;
        if (this.passport.isEnableSession()) {
          return this.passport.logOutFromSession(req, options).catch(err => {
            if (done) {
              done(err);
            } else {
              throw err;
            }
          });
        } else {
          return Promise.resolve().then(() => {
            if (done) {
              done();
            }
          });
        }
      };
      req.isAuthenticated = () => {
        const property = this.passport.getUserProperty();
        return !!this[property];
      };
      req.isUnauthenticated = () => {
        return !req.isAuthenticated();
      };
    }
  }

  return InnerPassportMiddleware as any;
}
