// prevent passport from monkey patching
const connect = require('passport/lib/framework/connect');
connect.__monkeypatchNode = function () {};

// load passport and add the koa framework
const originPassport = require('passport');
const Passport = require('passport').Passport;
const framework = require('./framework/koa')();

originPassport.framework(framework);

export class KoaPassport extends Passport {
  constructor() {
    super();
    this.framework(framework);
  }
}

// Export default singleton.
export const passport = originPassport;
