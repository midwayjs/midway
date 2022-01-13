import { Middleware } from '@midwayjs/decorator';
import { CSRFError } from '../error';
import * as CsrfTokens from 'csrf';
import { isSafeDomain, parseUrl } from '../utils';
import { BaseMiddleware } from './base';

const _CSRF_SECRET = Symbol('midway-security#_CSRF_SECRET');
const tokens = new CsrfTokens();
@Middleware()
export class CSRFMiddleware extends BaseMiddleware {
  async compatibleMiddleware(req, res, next) {
    req.assertCsrf = () => {
      this.assertCsrf(req);
    };
    return next();
  }

  assertCsrf(context) {
    const { type } = this.security.csrf;
    switch (type) {
      case 'ctoken':
        this.checkCSRFToken(context);
        break;
      case 'referer':
        this.checkCSRFReferer(context);
        break;
      case 'all':
      case 'any':
        this.checkCSRFToken(context);
        this.checkCSRFReferer(context);
        break;
      default:
        throw new CSRFError();
    }
  }

  getCSRFSecret(context) {
    if (this[_CSRF_SECRET]) return this[_CSRF_SECRET];
    const { useSession, sessionName } = this.security.csrf;
    let { cookieName } = this.security.csrf;
    // // get secret from session or cookie
    if (useSession) {
      this[_CSRF_SECRET] = context.session[sessionName] || '';
    } else {
      // cookieName support array. so we can change csrf cookie name smoothly
      if (!Array.isArray(cookieName)) {
        cookieName = [cookieName];
      }
      for (const name of cookieName) {
        this[_CSRF_SECRET] = context.cookies.get(name, { signed: false }) || '';
        if (this[_CSRF_SECRET]) break;
      }
    }
    return this[_CSRF_SECRET];
  }

  getInputToken(context) {
    const { headerName, bodyName, queryName } = this.security.csrf;
    return (
      context.query?.[queryName] ||
      context.body?.[bodyName] ||
      (headerName && context.get(headerName))
    );
  }

  private checkCSRFToken(context) {
    const tokenSecret = this.getCSRFSecret(context);
    if (!tokenSecret) {
      throw new CSRFError('missing csrf token');
    }
    const token = this.getInputToken(context);
    if (token !== tokenSecret && !tokens.verify(tokenSecret, token)) {
      throw new CSRFError('invalid csrf token');
    }
  }

  private checkCSRFReferer(context) {
    const { refererWhiteList } = this.security.csrf;
    const referer = (context.get('referer') || '').toLowerCase();
    if (!referer) {
      throw new CSRFError('missing csrf referer');
    }

    const host = parseUrl(referer, 'host');
    const domainList = refererWhiteList.concat(context.host);
    if (!host || !isSafeDomain(host, domainList)) {
      throw new CSRFError('invalid csrf referer');
    }
  }
}
