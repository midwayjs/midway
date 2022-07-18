import { extend } from '@midwayjs/core';

export class SessionManager {
  key;
  serializeUser;

  constructor(options, serializeUser) {
    options = options || {};
    this.key = options.key || 'passport';
    this.serializeUser = serializeUser;
  }

  logIn(req, user, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    options = options || {};

    if (!req.session) {
      return cb(
        new Error(
          'Login sessions require session support. Did you forget to use `express-session` middleware?'
        )
      );
    }

    const prevSession = req.session;

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(err => {
      if (err) {
        return cb(err);
      }

      this.serializeUser(user, req, function (err, obj) {
        if (err) {
          return cb(err);
        }
        if (options.keepSessionInfo) {
          extend(true, req.session, prevSession);
        }
        if (!req.session[this.key]) {
          req.session[this.key] = {};
        }
        // store user information in session, typically a user id
        req.session[this.key].user = obj;
        // save the session before redirection to ensure page
        // load does not happen before session is saved
        req.session.save(err => {
          if (err) {
            return cb(err);
          }
          cb();
        });
      });
    });
  }

  logOut(req, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    options = options || {};

    if (!req.session) {
      return cb(
        new Error(
          'Login sessions require session support. Did you forget to use `express-session` middleware?'
        )
      );
    }

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    if (req.session[this.key]) {
      delete req.session[this.key].user;
    }
    const prevSession = req.session;

    req.session.save(err => {
      if (err) {
        return cb(err);
      }

      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session.regenerate(err => {
        if (err) {
          return cb(err);
        }
        if (options.keepSessionInfo) {
          extend(true, req.session, prevSession);
        }
        cb();
      });
    });
  }
}
