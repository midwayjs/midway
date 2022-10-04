import {
  Config,
  Inject,
  Logger,
  Middleware,
  Types,
  Utils,
  IMiddleware,
} from '@midwayjs/core';
import { SessionStoreManager } from '../lib/store';
import { decode, encode } from '../lib/util';
import * as assert from 'assert';
import { ContextSession } from '../lib/context';
import { SessionOptions } from '../interface';

const CONTEXT_SESSION = Symbol('context#contextSession');
const _CONTEXT_SESSION = Symbol('context#_contextSession');

/**
 * format and check session options
 * @param  {Object} opts session options
 * @return {Object} new session options
 *
 * @api private
 */
function formatOpts(opts) {
  opts = opts || {};
  // key
  opts.key = opts.key || 'koa.sess';

  // back-compat maxage
  if (!('maxAge' in opts)) opts.maxAge = opts.maxage;

  // defaults
  if (opts.overwrite == null) opts.overwrite = true;
  if (opts.httpOnly == null) opts.httpOnly = true;
  // delete null sameSite config
  if (opts.sameSite == null) delete opts.sameSite;
  if (opts.signed == null) opts.signed = true;
  if (opts.autoCommit == null) opts.autoCommit = true;

  // setup encoding/decoding
  if (typeof opts.encode !== 'function') {
    opts.encode = encode;
  }
  if (typeof opts.decode !== 'function') {
    opts.decode = decode;
  }

  const store = opts.store;
  if (store) {
    assert(Types.isFunction(store.get), 'store.get must be function');
    assert(Types.isFunction(store.set), 'store.set must be function');
    assert(Types.isFunction(store.destroy), 'store.destroy must be function');
  }

  const externalKey = opts.externalKey;
  if (externalKey) {
    assert(
      Types.isFunction(externalKey.get),
      'externalKey.get must be function'
    );
    assert(
      Types.isFunction(externalKey.set),
      'externalKey.set must be function'
    );
  }

  const ContextStore = opts.ContextStore;
  if (ContextStore) {
    assert(Types.isClass(ContextStore), 'ContextStore must be a class');
    assert(
      Types.isFunction(ContextStore.prototype.get),
      'ContextStore.prototype.get must be function'
    );
    assert(
      Types.isFunction(ContextStore.prototype.set),
      'ContextStore.prototype.set must be function'
    );
    assert(
      Types.isFunction(ContextStore.prototype.destroy),
      'ContextStore.prototype.destroy must be function'
    );
  }

  if (!opts.genid) {
    if (opts.prefix) {
      opts.genid = () => `${opts.prefix}${Utils.randomUUID()}`;
    } else {
      opts.genid = Utils.randomUUID;
    }
  }

  return opts;
}

/**
 * extend context prototype, add session properties
 *
 * @param  {Object} context koa's context prototype
 * @param  {Object} opts session options
 *
 * @api private
 */

function extendContext(context, opts) {
  // eslint-disable-next-line no-prototype-builtins
  if (context.hasOwnProperty(CONTEXT_SESSION)) {
    return;
  }
  Object.defineProperties(context, {
    [CONTEXT_SESSION]: {
      get() {
        if (this[_CONTEXT_SESSION]) {
          return this[_CONTEXT_SESSION];
        }
        this[_CONTEXT_SESSION] = new ContextSession(this, opts);
        return this[_CONTEXT_SESSION];
      },
    },
    session: {
      get() {
        return this[CONTEXT_SESSION].get();
      },
      set(val) {
        this[CONTEXT_SESSION].set(val);
      },
      configurable: true,
    },
    sessionOptions: {
      get() {
        return this[CONTEXT_SESSION].opts;
      },
    },
  });
}

@Middleware()
export class SessionMiddleware implements IMiddleware<any, any> {
  @Config('session')
  sessionConfig;

  @Logger()
  logger;

  @Inject()
  sessionStoreManager: SessionStoreManager;

  resolve(app) {
    if (!this.sessionConfig.httpOnly) {
      this.logger.warn(
        '[midway-session]: please set `config.session.httpOnly` to true. It is very dangerous if session can read by client JavaScript.'
      );
    }
    const store = this.sessionStoreManager.getSessionStore();
    if (store) {
      this.sessionConfig.store = store;
    }

    const opts = formatOpts(this.sessionConfig) as SessionOptions;
    extendContext(app.context, opts);

    return async function session(ctx, next) {
      const sess = ctx[CONTEXT_SESSION] as ContextSession;
      if (sess.store) {
        await sess.initFromExternal();
      }
      try {
        await next();
      } finally {
        if (opts.autoCommit) {
          await sess.commit();
        }
      }
    };
  }

  static getName() {
    return 'session';
  }
}
