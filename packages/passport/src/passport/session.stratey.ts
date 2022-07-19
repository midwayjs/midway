import { Strategy } from './strategy';
import { httpError } from '@midwayjs/core';
import { pause } from './pause';

/**
 * `SessionStrategy` constructor.
 *
 * @api public
 */
export class SessionStrategy extends Strategy {
  _deserializeUser;

  constructor(
    readonly options: {
      userProperty: string;
      sessionUserProperty: string;
      pauseStream?: boolean;
    },
    deserializeUser
  ) {
    super();
    this.name = 'session';
    this._deserializeUser = deserializeUser;
  }

  /**
   * Authenticate request based on the current session state.
   *
   * The session authentication strategy uses the session to restore any login
   * state across requests.  If a login session has been established, `req.user`
   * will be populated with the current user.
   *
   * This strategy is registered automatically by Passport.
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  authenticate(req, options) {
    if (!req.session) {
      return new httpError.UnauthorizedError(
        'Login sessions require session support，please enable it.'
      );
    }
    options = options || {};

    let su;
    if (req.session[this.options.sessionUserProperty]) {
      su = req.session[this.options.sessionUserProperty].user;
    }

    if (su || su === 0) {
      // NOTE: Stream pausing is desirable in the case where later middleware is
      //       listening for events emitted from request.  For discussion on the
      //       matter, refer to: https://github.com/jaredhanson/passport/pull/106

      const paused = options.pauseStream ? pause(req) : null;
      this._deserializeUser(su, req, (err, user) => {
        if (err) {
          return new httpError.UnauthorizedError(err.message);
        }
        if (!user) {
          delete req.session[this.options.sessionUserProperty].user;
          this.pass();
        } else {
          this.success(user);
        }

        if (paused) {
          paused.resume();
        }
      });
    } else {
      this.pass();
    }
  }
}
