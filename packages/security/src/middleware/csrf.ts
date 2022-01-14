import { Middleware } from '@midwayjs/decorator';
import { CSRFError } from '../error';
import * as CsrfTokens from 'csrf';
import { isSafeDomain, parseUrl } from '../utils';
import { BaseMiddleware } from './base';

const _CSRF_SECRET = Symbol('midway-security#_CSRF_SECRET');
const NEW_CSRF_SECRET = Symbol('midway-security#NEW_CSRF_SECRET');
const tokens = new CsrfTokens();
@Middleware()
export class CSRFMiddleware extends BaseMiddleware {
  async compatibleMiddleware(req, res, next) {
    req.assertCsrf = () => {
      this.assertCsrf(req);
    };

    // Must call this method when user login to ensure each user has independent secret.
    req.rotateCsrfSecret = () => {
      if (!req[NEW_CSRF_SECRET] && this.getCSRFSecret(req)) {
        this.ensureCsrfSecret(req, res, true);
      }
    };

    Object.defineProperty(req, 'csrf', {
      get: () => {
        const secret = req[NEW_CSRF_SECRET] || this.getCSRFSecret(req);
        return secret ? tokens.create(secret) : '';
      },
    });

    // ensure csrf token exists
    if (['any', 'all', 'ctoken'].includes(this.security.csrf.type)) {
      this.ensureCsrfSecret(req, res);
    }

    // ignore requests: get, head, options and trace
    const method = req.method.toUpperCase();
    const ignoreMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
    if (!ignoreMethods.includes(method)) {
      req.assertCsrf();
    }

    return next();
  }

  assertCsrf(request) {
    const { type } = this.security.csrf;
    switch (type) {
      case 'ctoken':
        this.checkCSRFToken(request);
        break;
      case 'referer':
        this.checkCSRFReferer(request);
        break;
      case 'all':
      case 'any':
        this.checkCSRFToken(request);
        this.checkCSRFReferer(request);
        break;
      default:
        throw new CSRFError();
    }
  }

  getCSRFSecret(request) {
    if (request[_CSRF_SECRET]) {
      return request[_CSRF_SECRET];
    }
    const { useSession, sessionName } = this.security.csrf;
    let { cookieName } = this.security.csrf;
    // // get secret from session or cookie
    if (useSession) {
      request[_CSRF_SECRET] = request.session[sessionName] || '';
    } else {
      // cookieName support array. so we can change csrf cookie name smoothly
      if (!Array.isArray(cookieName)) {
        cookieName = [cookieName];
      }
      for (const name of cookieName) {
        request[_CSRF_SECRET] =
          request.cookies.get(name, { signed: false }) || '';
        if (request[_CSRF_SECRET]) break;
      }
    }
    return request[_CSRF_SECRET];
  }

  getInputToken(request) {
    const { headerName, bodyName, queryName } = this.security.csrf;
    return (
      request.query?.[queryName] ||
      request.body?.[bodyName] ||
      (headerName && request.get(headerName))
    );
  }

  private checkCSRFToken(request) {
    const tokenSecret = this.getCSRFSecret(request);
    if (!tokenSecret) {
      throw new CSRFError('missing csrf token');
    }
    const token = this.getInputToken(request);
    if (token !== tokenSecret && !tokens.verify(tokenSecret, token)) {
      throw new CSRFError('invalid csrf token');
    }
  }

  private checkCSRFReferer(request) {
    const { refererWhiteList } = this.security.csrf;
    const referer = (request.get('referer') || '').toLowerCase();
    if (!referer) {
      throw new CSRFError('missing csrf referer');
    }

    const host = parseUrl(referer, 'host');
    const domainList = refererWhiteList.concat(request.host);
    if (!host || !isSafeDomain(host, domainList)) {
      throw new CSRFError('invalid csrf referer');
    }
  }

  private ensureCsrfSecret(request, response, rotate?) {
    const tokenSecret = this.getCSRFSecret(request);
    if (tokenSecret && !rotate) {
      return;
    }
    const secret = tokens.secretSync();
    request[NEW_CSRF_SECRET] = secret;
    const { useSession, sessionName, cookieDomain } = this.security.csrf;
    let { cookieName } = this.security.csrf;

    if (useSession) {
      request.session[sessionName] = secret;
    } else {
      const cookieOpts = {
        domain: cookieDomain && cookieDomain(request),
        signed: false,
        httpOnly: false,
        overwrite: true,
      };
      // cookieName support array. so we can change csrf cookie name smoothly
      if (!Array.isArray(cookieName)) {
        cookieName = [cookieName];
      }
      for (const name of cookieName) {
        response.cookies.set(name, secret, cookieOpts);
      }
    }
  }
}
