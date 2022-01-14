import { debuglog } from 'util';
import { ONE_DAY, COOKIE_EXP_DATE, hash } from './util';
import { Session } from './session';
const debug = debuglog('session:context');

export class ContextSession {
  private ctx: any;
  private app: any;
  private opts: any;
  private session;
  private externalKey: string;
  private prevHash: number;
  store: any;

  /**
   * context session constructor
   * @api public
   */
  constructor(ctx, opts) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.opts = Object.assign({}, opts);
    this.store = this.opts.ContextStore
      ? new this.opts.ContextStore(ctx)
      : this.opts.store;
  }

  /**
   * internal logic of `ctx.session`
   * @return {Session} session object
   *
   * @api public
   */

  get() {
    const session = this.session;
    // already retrieved
    if (session) return session;
    // unset
    if (session === false) return null;

    // create an empty session or init from cookie
    this.store ? this.create() : this.initFromCookie();
    return this.session;
  }

  /**
   * internal logic of `ctx.session=`
   * @param {Object} val session object
   *
   * @api public
   */

  set(val) {
    if (val === null) {
      this.session = false;
      return;
    }
    if (typeof val === 'object') {
      // use the original `externalKey` if exists to avoid waste storage
      this.create(val, this.externalKey);
      return;
    }
    throw new Error('this.session can only be set as null or an object.');
  }

  /**
   * init session from external store
   * will be called in the front of session middleware
   *
   * @api public
   */

  async initFromExternal() {
    debug('init from external');
    const ctx = this.ctx;
    const opts = this.opts;

    let externalKey;
    if (opts.externalKey) {
      externalKey = opts.externalKey.get(ctx);
      debug('get external key from custom %s', externalKey);
    } else {
      externalKey = ctx.cookies.get(opts.key, opts);
      debug('get external key from cookie %s', externalKey);
    }

    if (!externalKey) {
      // create a new `externalKey`
      this.create();
      return;
    }

    const json = await this.store.get(externalKey, opts.maxAge, {
      ctx,
      rolling: opts.rolling,
    });
    if (!this.valid(json, externalKey)) {
      // create a new `externalKey`
      this.create();
      return;
    }

    // create with original `externalKey`
    this.create(json, externalKey);
    this.prevHash = hash(this.session.toJSON());
  }

  /**
   * init session from cookie
   * @api private
   */

  initFromCookie() {
    debug('init from cookie');
    const ctx = this.ctx;
    const opts = this.opts;

    const cookie = ctx.cookies.get(opts.key, opts);
    if (!cookie) {
      this.create();
      return;
    }

    let json;
    debug('parse %s', cookie);
    try {
      json = opts.decode(cookie);
    } catch (err) {
      // backwards compatibility:
      // create a new session if parsing fails.
      // new Buffer(string, 'base64') does not seem to crash
      // when `string` is not base64-encoded.
      // but `JSON.parse(string)` will crash.
      debug('decode %j error: %s', cookie, err);
      if (!(err instanceof SyntaxError)) {
        // clean this cookie to ensure next request won't throw again
        ctx.cookies.set(opts.key, '', opts);
        // ctx.onerror will unset all headers, and set those specified in err
        err.headers = {
          'set-cookie': ctx.response.get('set-cookie'),
        };
        throw err;
      }
      this.create();
      return;
    }

    debug('parsed %j', json);

    if (!this.valid(json)) {
      this.create();
      return;
    }

    // support access `ctx.session` before session middleware
    this.create(json);
    this.prevHash = hash(this.session.toJSON());
  }

  /**
   * verify session(expired or )
   * @param  {Object} value session object
   * @param  {Object} key session externalKey(optional)
   * @return {Boolean} valid
   * @api private
   */

  valid(value, key?) {
    const ctx = this.ctx;
    if (!value) {
      this.emit('missed', { key, value, ctx });
      return false;
    }

    if (value._expire && value._expire < Date.now()) {
      debug('expired session');
      this.emit('expired', { key, value, ctx });
      return false;
    }

    const valid = this.opts.valid;
    if (typeof valid === 'function' && !valid(ctx, value)) {
      // valid session value fail, ignore this session
      debug('invalid session');
      this.emit('invalid', { key, value, ctx });
      return false;
    }
    return true;
  }

  /**
   * @param {String} event event name
   * @param {Object} data event data
   * @api private
   */
  emit(event, data) {
    setImmediate(() => {
      this.app.emit(`session:${event}`, data);
    });
  }

  /**
   * create a new session and attach to ctx.sess
   *
   * @param {Object} [val] session data
   * @param {String} [externalKey] session external key
   * @api private
   */

  create(val?, externalKey?) {
    debug('create session with val: %j externalKey: %s', val, externalKey);
    if (this.store) {
      this.externalKey =
        externalKey || (this.opts.genid && this.opts.genid(this.ctx));
    }
    this.session = new Session(this, val, this.externalKey);
  }

  /**
   * Commit the session changes or removal.
   *
   * @api public
   */

  async commit() {
    const session = this.session;
    const opts = this.opts;
    const ctx = this.ctx;

    // not accessed
    if (undefined === session) return;

    // removed
    if (session === false) {
      await this.remove();
      return;
    }

    const reason = this._shouldSaveSession();
    debug('should save session: %s', reason);
    if (!reason) return;

    if (typeof opts.beforeSave === 'function') {
      debug('before save');
      opts.beforeSave(ctx, session);
    }
    const changed = reason === 'changed';
    await this.save(changed);
  }

  _shouldSaveSession() {
    const prevHash = this.prevHash;
    const session = this.session;

    // force save session when `session._requireSave` set
    if (session._requireSave) return 'force';

    // do nothing if new and not populated
    const json = session.toJSON();
    if (!prevHash && !Object.keys(json).length) return '';

    // save if session changed
    const changed = prevHash !== hash(json);
    if (changed) return 'changed';

    // save if opts.rolling set
    if (this.opts.rolling) return 'rolling';

    // save if opts.renew and session will expired
    if (this.opts.renew) {
      const expire = session._expire;
      const maxAge = session.maxAge;
      // renew when session will expired in maxAge / 2
      if (expire && maxAge && expire - Date.now() < maxAge / 2) return 'renew';
    }

    return '';
  }

  /**
   * remove session
   * @api private
   */

  async remove() {
    // Override the default options so that we can properly expire the session cookies
    const opts = Object.assign({}, this.opts, {
      expires: COOKIE_EXP_DATE,
      maxAge: false,
    });

    const ctx = this.ctx;
    const key = opts.key;
    const externalKey = this.externalKey;

    if (externalKey) {
      await this.store.destroy(externalKey, { ctx });
    }
    ctx.cookies.set(key, '', opts);
  }

  /**
   * save session
   * @api private
   */

  async save(changed) {
    const opts = this.opts;
    const key = opts.key;
    const externalKey = this.externalKey;
    let json = this.session.toJSON();
    // set expire for check
    let maxAge = opts.maxAge ? opts.maxAge : ONE_DAY;
    if (maxAge === 'session') {
      // do not set _expire in json if maxAge is set to 'session'
      // also delete maxAge from options
      opts.maxAge = undefined;
      json._session = true;
    } else {
      // set expire for check
      json._expire = maxAge + Date.now();
      json._maxAge = maxAge;
    }

    // save to external store
    if (externalKey) {
      debug('save %j to external key %s', json, externalKey);
      if (typeof maxAge === 'number') {
        // ensure store expired after cookie
        maxAge += 10000;
      }
      await this.store.set(externalKey, json, maxAge, {
        changed,
        ctx: this.ctx,
        rolling: opts.rolling,
      });
      if (opts.externalKey) {
        opts.externalKey.set(this.ctx, externalKey);
      } else {
        this.ctx.cookies.set(key, externalKey, opts);
      }
      return;
    }

    // save to cookie
    debug('save %j to cookie', json);
    json = opts.encode(json);
    debug('save %s', json);

    this.ctx.cookies.set(key, json, opts);
  }
}
