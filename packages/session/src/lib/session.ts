/**
 * Session model.
 */
import { ISession } from '../interface';

export class Session implements ISession {
  private _sessCtx;
  private _ctx: any;
  private _externalKey;
  _requireSave;
  isNew = true;

  /**
   * Session constructor
   * @param sessionContext
   * @param {Object} obj
   * @param externalKey
   */
  constructor(sessionContext, obj, externalKey) {
    this._sessCtx = sessionContext;
    this._ctx = sessionContext.ctx;
    this._externalKey = externalKey;
    if (!obj) {
      this.isNew = true;
    } else {
      for (const k in obj) {
        // restore maxAge from store
        if (k === '_maxAge') this._ctx.sessionOptions.maxAge = obj._maxAge;
        else if (k === '_session') this._ctx.sessionOptions.maxAge = 'session';
        else this[k] = obj[k];
      }
    }
  }

  /**
   * JSON representation of the session.
   *
   * @return {Object}
   * @api public
   */

  toJSON() {
    const obj = {};

    Object.keys(this).forEach(key => {
      if (key === 'isNew') return;
      if (key[0] === '_') return;
      obj[key] = this[key];
    });

    return obj;
  }

  /**
   * Return how many values there are in the session object.
   * Used to see if it's "populated".
   *
   * @return {Number}
   * @api public
   */

  get length() {
    return Object.keys(this.toJSON()).length;
  }

  /**
   * populated flag, which is just a boolean alias of .length.
   *
   * @return {Boolean}
   * @api public
   */

  get populated() {
    return !!this.length;
  }

  /**
   * get session maxAge
   *
   * @return {Number}
   * @api public
   */

  get maxAge() {
    return this._ctx.sessionOptions.maxAge;
  }

  /**
   * set session maxAge
   *
   * @api public
   * @param val
   */

  set maxAge(val) {
    this._ctx.sessionOptions.maxAge = val;
    // maxAge changed, must save to cookie and store
    this._requireSave = true;
  }

  /**
   * get session external key
   * only exist if opts.store present
   */
  get externalKey() {
    return this._externalKey;
  }

  /**
   * save this session no matter whether it is populated
   *
   * @api public
   */

  save(callback) {
    return this.commit({ save: true }, callback);
  }

  /**
   * regenerate this session
   *
   * @param  {Function} callback the optional function to call after regenerating the session
   * @api public
   */

  regenerate(callback) {
    return this.commit({ regenerate: true }, callback);
  }

  /**
   * commit this session's headers if autoCommit is set to false
   *
   * @api public
   */

  manuallyCommit() {
    return this.commit();
  }

  commit(options?, callback?) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const promise = this._sessCtx.commit(options);
    if (callback) {
      promise.then(() => callback(), callback);
    } else {
      return promise;
    }
  }
}
