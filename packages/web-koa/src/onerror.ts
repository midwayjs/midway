import * as http from 'http';
import {
  accepts,
  detectStatus,
  isProduction,
  sendToWormhole,
  escapeHtml,
  tpl,
} from './utils';
import { Utils } from '@midwayjs/core';

export function setupOnError(app, config, logger) {
  const errorOptions = Object.assign(
    {
      // support customize accepts function
      accepts() {
        const fn = config.accepts || accepts;
        return fn(this);
      },
      /**
       * default text error handler
       * @param {Error} err
       * @param ctx
       */
      text(err, ctx) {
        // unset all headers, and set those specified
        ctx.res._headers = {};
        ctx.set(err.headers);

        if (isProduction(app)) {
          ctx.body = http.STATUS_CODES[ctx.status];
        } else {
          ctx.body = err.message;
        }
      },
      /**
       * default html error handler
       * @param {Error} err
       */
      html(err, ctx) {
        const status = detectStatus(err);
        if (isProduction(app)) {
          // 5xx
          if (status >= 500) {
            ctx.status = 500;
            ctx.body = `<h2>Internal Server Error, real status: ${status}</h2>`;
            return;
          } else {
            // 4xx
            ctx.status = status;
            ctx.body = `<h2>${status} ${http.STATUS_CODES[status]}</h2>`;
            return;
          }
        }

        // show simple error format for unittest
        if (app.getEnv() === 'unittest' || app.getEnv() === 'test') {
          ctx.status = status;
          ctx.body = `${err.name}: ${err.message}\n${err.stack}`;
          return;
        }

        ctx.body = tpl
          .replace('{{status}}', escapeHtml(err.status))
          .replace('{{errorCode}}', escapeHtml(err.code))
          .replace('{{stack}}', escapeHtml(err.stack));
        ctx.type = 'html';
      },
      /**
       * default json error handler
       * @param {Error} err
       * @param ctx
       */
      json(err, ctx) {
        const status = detectStatus(err);
        const code = err.code || err.type;

        if (isProduction(app)) {
          if (status >= 500) {
            ctx.body = { code, message: http.STATUS_CODES[status] };
          } else {
            ctx.body = { code, message: err.message };
          }
        } else {
          ctx.body = { code, message: err.message, stack: err.stack };
        }
      },
    },
    config
  );

  app.on('error', (err, ctx) => {
    ctx = ctx || app.createAnonymousContext();
    const status = detectStatus(err);
    // 5xx
    if (status >= 500) {
      try {
        ctx.logger.error(err);
      } catch (ex) {
        logger.error(err);
        logger.error(ex);
      }
      return;
    }

    // 4xx
    try {
      ctx.logger.warn(err);
    } catch (ex) {
      logger.warn(err);
      logger.error(ex);
    }
  });

  app.context.onerror = function (err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (err == null) return;

    // ignore all pedding request stream
    if (this.req) sendToWormhole(this.req);

    // wrap non-error object
    if (!(err instanceof Error)) {
      let errMsg = err;
      if (typeof err === 'object') {
        try {
          errMsg = Utils.safeStringify(err);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }
      const newError = new Error('non-error thrown: ' + errMsg);
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
        if (err.status) newError['status'] = err.status;
        if (err.headers) newError['headers'] = err.headers;
      }
      err = newError;
    }

    const headerSent = this.headerSent || !this.writable;
    if (headerSent) err.headerSent = true;

    // delegate
    app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (headerSent) return;

    // ENOENT support
    if (err.code === 'ENOENT') err.status = 404;

    if (typeof err.status !== 'number' || !http.STATUS_CODES[err.status]) {
      err.status = 500;
    }
    this.status = err.status;

    this.set(err.headers);
    let type = 'text';
    if (errorOptions.accepts) {
      type = errorOptions.accepts.call(this, 'html', 'text', 'json');
    } else {
      type = this.accepts('html', 'text', 'json');
    }
    type = type || 'text';
    if (errorOptions.all) {
      errorOptions.all.call(this, err, this);
    } else {
      if (errorOptions.redirect && type !== 'json') {
        this.redirect(errorOptions.redirect);
      } else {
        errorOptions[type].call(this, err, this);
        this.type = type;
      }
    }

    if (type === 'json') {
      this.body = JSON.stringify(this.body);
    }
    this.res.end(this.body);
  };
}
