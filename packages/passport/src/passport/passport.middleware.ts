import { ApplicationContext, Config, Inject } from '@midwayjs/decorator';
import { IMidwayContainer, IMidwayFramework } from '@midwayjs/core';
import { create as createReqMock } from '../proxy/framework/request';
import { PassportAuthenticator } from './authenticator';

const incomingMessageExt = {
  /**
   * Initiate a login session for `user`.
   *
   * Options:
   *   - `session`  Save login state in session, defaults to _true_
   *
   * Examples:
   *
   *     req.logIn(user, { session: false });
   *
   *     req.logIn(user, function(err) {
   *       if (err) { throw err; }
   *       // session saved
   *     });
   *
   * @param {User} user
   * @param {Object} options
   * @param {Function} done
   * @api public
   */
  logIn(user, options, done) {
    if (typeof options === 'function') {
      done = options;
      options = {};
    }
    options = options || {};

    const property = this._userProperty || 'user';
    const session = options.session === undefined ? true : options.session;

    this[property] = user;
    if (session && this._sessionManager) {
      if (typeof done !== 'function') {
        throw new Error('req#login requires a callback function');
      }

      this._sessionManager.logIn(this, user, options, err => {
        if (err) {
          this[property] = null;
          return done(err);
        }
        done();
      });
    } else {
      done && done();
    }
  },

  /**
   * Terminate an existing login session.
   *
   * @api public
   */
  logOut(options, done) {
    if (typeof options === 'function') {
      done = options;
      options = {};
    }
    options = options || {};

    const property = this._userProperty || 'user';

    this[property] = null;
    if (this._sessionManager) {
      if (typeof done !== 'function') {
        throw new Error('req#logout requires a callback function');
      }

      this._sessionManager.logOut(this, options, done);
    } else {
      done && done();
    }
  },

  /**
   * Test if request is authenticated.
   *
   * @return {Boolean}
   * @api public
   */
  isAuthenticated() {
    const property = this._userProperty || 'user';
    return !!this[property];
  },

  /**
   * Test if request is unauthenticated.
   *
   * @return {Boolean}
   * @api public
   */
  isUnauthenticated() {
    return !this.isAuthenticated();
  },
};

export class PassportInitializeMiddleware {
  @Config('passport')
  passportConfig;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Inject()
  passportAuthenticator: PassportAuthenticator;

  resolve(app: IMidwayFramework<any, any, any>) {
    if (this.passportAuthenticator.isExpressMode()) {
      return (req, res, next) => {
        req.login = req.logIn = incomingMessageExt.logIn;
        req.logout = req.logOut = incomingMessageExt.logOut;
        req.isAuthenticated = incomingMessageExt.isAuthenticated;
        req.isUnauthenticated = incomingMessageExt.isUnauthenticated;

        // req._sessionManager = passport._sm;
        //
        // if (this.passportConfig.userProperty) {
        //   req._userProperty = this.passportConfig.userProperty;
        // }

        // const compat = (options.compat === undefined) ? true : options.compat;
        // if (compat) {
        // `passport@0.5.1` [removed][1] all internal use of `req._passport`.
        // From the standpoint of this package, this should have been a
        // non-breaking change.  However, some strategies (such as `passport-azure-ad`)
        // depend directly on `passport@0.4.x` or earlier.  `require`-ing earlier
        // versions of `passport` has the effect of monkeypatching `http.IncomingMessage`
        // with `logIn`, `logOut`, `isAuthenticated` and `isUnauthenticated`
        // functions that [expect][2] the `req._passport` property to exist.
        // Since pre-existing functions on `req` are given [preference][3], this
        // results in [issues][4].
        //
        // The changes here restore the expected properties needed when earlier
        // versions of `passport` are `require`-ed.  This compatibility mode is
        // enabled by default, and can be disabld by simply not `use`-ing `passport.initialize()`
        // middleware or setting `compat: false` as an option to the middleware.
        //
        // An alternative approach to addressing this issue would be to not
        // preferentially use pre-existing functions on `req`, but rather always
        // overwrite `req.logIn`, etc. with the versions of those functions shiped
        // with `authenticate()` middleware.  This option should be reconsidered
        // in a future major version release.
        //
        // [1]: https://github.com/jaredhanson/passport/pull/875
        // [2]: https://github.com/jaredhanson/passport/blob/v0.4.1/lib/http/request.js
        // [3]: https://github.com/jaredhanson/passport/blob/v0.5.1/lib/middleware/authenticate.js#L96
        // [4]: https://github.com/jaredhanson/passport/issues/877
        // passport._userProperty = options.userProperty || 'user';
        //
        // req._passport = {};
        // req._passport.instance = passport;
        // }

        next();
      };
    } else {
      return async (ctx, next) => {
        // koa <-> connect compatibility:
        const userProperty = passport._userProperty || 'user';
        // check ctx.req has the userProperty
        // eslint-disable-next-line no-prototype-builtins
        if (!ctx.req.hasOwnProperty(userProperty)) {
          Object.defineProperty(ctx.req, userProperty, {
            enumerable: true,
            get: function () {
              return ctx.state[userProperty];
            },
            set: function (val) {
              ctx.state[userProperty] = val;
            },
          });
        }

        // create mock object for express' req object
        const req = createReqMock(ctx, userProperty);

        // add Promise-based login method
        const login = req.login;
        ctx.login = ctx.logIn = function (user, options) {
          return new Promise<void>((resolve, reject) => {
            // fix session manager missing
            if (!req._sessionManager) {
              req._sessionManager = passport._sm;
            }
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

        await next();
      };
    }
  }

  static getName() {
    return 'passport_init';
  }
}
