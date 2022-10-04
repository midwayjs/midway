import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Config,
  ApplicationContext,
  extend,
  IMidwayContainer,
} from '@midwayjs/core';
import { SessionStrategy } from './session.stratey';
import { AuthenticateOptions } from '../interface';
import { Strategy } from './strategy';
import { IncomingMessage } from 'http';

@Provide()
@Scope(ScopeEnum.Singleton)
export class PassportAuthenticator {
  private strategies = new Map();
  private userProperty: string;
  private sessionUserProperty: string;
  _key = 'passport';
  _serializers = [];
  _deserializers = [];
  _infoTransformers = [];

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Config('passport')
  passportConfig;

  @Init()
  protected init() {
    this.userProperty = this.passportConfig['userProperty'];
    this.sessionUserProperty = this.passportConfig['sessionUserProperty'];
    if (this.isEnableSession()) {
      this.use(
        'session',
        new SessionStrategy(
          {
            userProperty: this.userProperty,
            sessionUserProperty: this.sessionUserProperty,
          },
          this.deserializeUser.bind(this)
        )
      );
    }
  }

  public isExpressMode() {
    return this.applicationContext.hasNamespace('express');
  }

  public isEnableSession(): boolean {
    return this.passportConfig['session'];
  }

  public getUserProperty() {
    return this.userProperty;
  }

  public getSessionUserProperty() {
    return this.sessionUserProperty;
  }

  public use(name: string | Strategy, strategy?: Strategy) {
    if (!strategy) {
      strategy = name as Strategy;
      name = strategy.name;
    }
    if (!name) {
      throw new Error('Authentication strategies must have a name');
    }

    this.strategies.set(name, strategy);
    return this;
  }

  public unuse(name: string) {
    this.strategies.delete(name);
    return this;
  }

  /**
   * Authenticates requests.
   *
   * Applies the `name`ed strategy (or strategies) to the incoming request, in
   * order to authenticate the request.  If authentication is successful, the user
   * will be logged in and populated at `req.user` and a session will be
   * established by default.  If authentication fails, an unauthorized response
   * will be sent.
   *
   * Options:
   *   - `session`          Save login state in session, defaults to _true_
   *   - `successRedirect`  After successful login, redirect to given URL
   *   - `successMessage`   True to store success message in
   *                        req.session.messages, or a string to use as override
   *                        message for success.
   *   - `successFlash`     True to flash success messages or a string to use as a flash
   *                        message for success (overrides any from the strategy itself).
   *   - `failureRedirect`  After failed login, redirect to given URL
   *   - `failureMessage`   True to store failure message in
   *                        req.session.messages, or a string to use as override
   *                        message for failure.
   *   - `failureFlash`     True to flash failure messages or a string to use as a flash
   *                        message for failures (overrides any from the strategy itself).
   *   - `assignProperty`   Assign the object provided by the verify callback to given property
   */
  public authenticate(
    strategies: Strategy[],
    options: AuthenticateOptions = {}
  ): (req) => Promise<{
    successResult?: { user: any; info: any } | undefined;
    redirectResult?: { url: string; status: number } | undefined;
    failResult?: { failures: Array<{ challenge: string; status: number }> };
  }> {
    return async req => {
      // accumulator for failures from each strategy in the chain
      const failures: Array<{ challenge: string; status: number }> = [];
      let shouldBreak = false;
      let successResult, redirectResult;

      for (const strategy of []
        .concat(Array.from(this.strategies.values()))
        .concat(strategies)) {
        if (shouldBreak) {
          break;
        }
        await new Promise<void>((resolve, reject) => {
          // ----- BEGIN STRATEGY AUGMENTATION -----
          // Augment the new strategy instance with action functions.  These action
          // functions are bound via closure the the request/response pair.  The end
          // goal of the strategy is to invoke *one* of these action methods, in
          // order to indicate successful or failed authentication, redirect to a
          // third-party identity provider, etc.

          /**
           * Authenticate `user`, with optional `info`.
           *
           * Strategies should call this function to successfully authenticate a
           * user.  `user` should be an object supplied by the application after it
           * has been given an opportunity to verify credentials.  `info` is an
           * optional argument containing additional user information.  This is
           * useful for third-party authentication strategies to pass profile
           * details.
           *
           * @param {Object} user
           * @param {Object} info
           * @api public
           */
          strategy.success = function (user, info) {
            successResult = {
              user,
              info,
            };
            shouldBreak = true;
            resolve();
          };

          /**
           * Fail authentication, with optional `challenge` and `status`, defaulting
           * to 401.
           *
           * Strategies should call this function to fail an authentication attempt.
           *
           * @param {String} challenge
           * @param {Number} status
           * @api public
           */
          strategy.fail = function (challenge, status) {
            if (typeof challenge === 'number') {
              status = challenge;
              challenge = undefined;
            }

            // push this failure into the accumulator and attempt authentication
            // using the next strategy
            failures.push({ challenge: challenge as any, status });
            resolve();
          };

          /**
           * Redirect to `url` with optional `status`, defaulting to 302.
           *
           * Strategies should call this function to redirect the user (via their
           * user agent) to a third-party website for authentication.
           *
           * @param {String} url
           * @param {Number} status
           * @api public
           */
          strategy.redirect = function (url, status) {
            redirectResult = { url, status };
            shouldBreak = true;
            resolve();
          };

          /**
           * Pass without making a success or fail decision.
           *
           * Under most circumstances, Strategies should not need to call this
           * function.  It exists primarily to allow previous authentication state
           * to be restored, for example from an HTTP session.
           *
           * @api public
           */
          strategy.pass = function () {
            resolve();
          };

          /**
           * Internal error while performing authentication.
           *
           * Strategies should call this function when an internal error occurs
           * during the process of performing authentication; for example, if the
           * user directory is not available.
           *
           * @param {Error} err
           * @api public
           */
          strategy.error = function (err) {
            shouldBreak = true;
            return reject(err);
          };

          strategy.authenticate(req, options);
        });
      }

      const failResult = {
        failures,
      };

      return {
        successResult,
        redirectResult,
        failResult,
      };
    };
  }

  public serializeUser(user, req, done) {
    const stack = this._serializers;
    (function pass(i, err, obj) {
      // serializers use 'pass' as an error to skip processing
      if ('pass' === err) {
        err = undefined;
      }
      // an error or serialized object was obtained, done
      if (err || obj || obj === 0) {
        return done(err, obj);
      }

      const layer = stack[i];
      if (!layer) {
        return done(new Error('Failed to serialize user into session'));
      }

      function serialized(e, o) {
        pass(i + 1, e, o);
      }

      try {
        const arity = layer.length;
        if (arity === 3) {
          layer(req, user, serialized);
        } else {
          layer(user, serialized);
        }
      } catch (e) {
        return done(e);
      }
    })(0);
  }

  /**
   * Registers a function used to deserialize user objects out of the session.
   *
   * Examples:
   *
   *     passport.deserializeUser(function(id, done) {
   *       User.findById(id, function (err, user) {
   *         done(err, user);
   *       });
   *     });
   *
   * @api public
   */
  public deserializeUser(obj, req, done) {
    const stack = this._deserializers;
    (function pass(i, err, user) {
      // deserializers use 'pass' as an error to skip processing
      if ('pass' === err) {
        err = undefined;
      }
      // an error or deserialized user was obtained, done
      if (err || user) {
        return done(err, user);
      }
      // a valid user existed when establishing the session, but that user has
      // since been removed
      if (user === null || user === false) {
        return done(null, false);
      }

      const layer = stack[i];
      if (!layer) {
        return done(new Error('Failed to deserialize user out of session'));
      }

      function deserialized(e, u) {
        pass(i + 1, e, u);
      }

      try {
        const arity = layer.length;
        if (arity === 3) {
          layer(req, obj, deserialized);
        } else {
          layer(obj, deserialized);
        }
      } catch (e) {
        return done(e);
      }
    })(0);
  }

  /**
   * Registers a function used to transform auth info.
   *
   * In some circumstances authorization details are contained in authentication
   * credentials or loaded as part of verification.
   *
   * For example, when using bearer tokens for API authentication, the tokens may
   * encode (either directly or indirectly in a database), details such as scope
   * of access or the client to which the token was issued.
   *
   * Such authorization details should be enforced separately from authentication.
   * Because Passport deals only with the latter, this is the responsiblity of
   * middleware or routes further along the chain.  However, it is not optimal to
   * decode the same data or execute the same database query later.  To avoid
   * this, Passport accepts optional `info` along with the authenticated `user`
   * in a strategy's `success()` action.  This info is set at `req.authInfo`,
   * where said later middlware or routes can access it.
   *
   * Optionally, applications can register transforms to proccess this info,
   * which take effect prior to `req.authInfo` being set.  This is useful, for
   * example, when the info contains a client ID.  The transform can load the
   * client from the database and include the instance in the transformed info,
   * allowing the full set of client properties to be convieniently accessed.
   *
   * If no transforms are registered, `info` supplied by the strategy will be left
   * unmodified.
   *
   * Examples:
   *
   *     passport.transformAuthInfo(function(info, done) {
   *       Client.findById(info.clientID, function (err, client) {
   *         info.client = client;
   *         done(err, info);
   *       });
   *     });
   *
   * @api public
   */
  public transformAuthInfo(info, req, done) {
    const stack = this._infoTransformers;
    (function pass(i, err, tinfo) {
      // transformers use 'pass' as an error to skip processing
      if ('pass' === err) {
        err = undefined;
      }
      // an error or transformed info was obtained, done
      if (err || tinfo) {
        return done(err, tinfo);
      }

      const layer = stack[i];
      if (!layer) {
        // if no transformers are registered (or they all pass), the default
        // behavior is to use the un-transformed info as-is
        return done(null, info);
      }

      function transformed(e, t) {
        pass(i + 1, e, t);
      }

      try {
        const arity = layer.length;
        if (arity === 1) {
          // sync
          const t = layer(info);
          transformed(null, t);
        } else if (arity === 3) {
          layer(req, info, transformed);
        } else {
          layer(info, transformed);
        }
      } catch (e) {
        return done(e);
      }
    })(0);
  }

  public async logInToSession(
    req: IncomingMessage & { session: any },
    user: any
  ) {
    if (!req.session) {
      new Error(
        'Login sessions require session support. Did you forget to use `express-session` middleware?'
      );
    }

    await new Promise<void>((resolve, reject) => {
      this.serializeUser(user, req, (err, obj) => {
        if (err) {
          reject(err);
        } else {
          if (!req.session[this.getSessionUserProperty()]) {
            req.session[this.getSessionUserProperty()] = {};
          }
          // store user information in session, typically a user id
          req.session[this.getSessionUserProperty()].user = obj;
          resolve();
        }
      });
    });
  }

  public async logOutFromSession(
    req,
    options: { keepSessionInfo?: boolean } = {}
  ) {
    if (!req.session) {
      new Error(
        'Login sessions require session support. Did you forget to use `express-session` middleware?'
      );
    }

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    if (req.session[this.getSessionUserProperty()]) {
      delete req.session[this.getSessionUserProperty()].user;
    }
    const prevSession = req.session;

    await new Promise<void>((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          return reject(err);
        }

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(err => {
          if (err) {
            return reject(err);
          }
          if (options.keepSessionInfo) {
            extend(true, req.session, prevSession);
          }
          resolve();
        });
      });
    });
  }

  public addSerializer(fn) {
    this._serializers.push(fn);
  }

  public addDeserializer(fn) {
    this._deserializers.push(fn);
  }

  public addInfoTransformer(fn) {
    this._infoTransformers.push(fn);
  }
}
