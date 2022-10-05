import { Middleware } from '@midwayjs/core';
import { CSRFError } from '../error';
import * as CsrfTokens from 'csrf';
import { isSafeDomain, parseUrl } from '../utils';
import { BaseMiddleware } from './base';

const _CSRF_SECRET = Symbol('midway-security#_CSRF_SECRET');
const NEW_CSRF_SECRET = Symbol('midway-security#NEW_CSRF_SECRET');
const tokens = new CsrfTokens();
@Middleware()
export class CSRFMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    context.assertCsrf = () => {
      this.assertCsrf(context, req);
    };

    // Must call this method when user login to ensure each user has independent secret.
    context.rotateCsrfSecret = () => {
      if (!context[NEW_CSRF_SECRET] && this.getCSRFSecret(context)) {
        this.ensureCsrfSecret(context, req, res, true);
      }
    };

    Object.defineProperty(context, 'csrf', {
      get: () => {
        const secret = context[NEW_CSRF_SECRET] || this.getCSRFSecret(context);
        return secret ? tokens.create(secret) : '';
      },
    });
    // ensure csrf token exists
    if (['any', 'all', 'ctoken'].includes(this.security.csrf.type)) {
      this.ensureCsrfSecret(context, req, res);
    }

    // ignore requests: get, head, options and trace
    const method = req.method.toUpperCase();
    const ignoreMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
    if (!ignoreMethods.includes(method)) {
      context.assertCsrf();
    }

    return next();
  }

  assertCsrf(context, request) {
    const { type } = this.security.csrf;
    switch (type) {
      case 'ctoken':
        this.checkCSRFToken(context, request);
        break;
      case 'referer':
        this.checkCSRFReferer(context, request);
        break;
      case 'all':
      case 'any':
        this.checkCSRFToken(context, request);
        this.checkCSRFReferer(context, request);
        break;
      default:
        throw new CSRFError();
    }
  }

  getCSRFSecret(context) {
    if (context[_CSRF_SECRET]) {
      return context[_CSRF_SECRET];
    }
    const { useSession, sessionName } = this.security.csrf;
    let { cookieName } = this.security.csrf;
    // // get secret from session or cookie
    if (useSession) {
      context[_CSRF_SECRET] = context.session[sessionName] || '';
    } else {
      // cookieName support array. so we can change csrf cookie name smoothly
      if (!Array.isArray(cookieName)) {
        cookieName = [cookieName];
      }
      for (const name of cookieName) {
        context[_CSRF_SECRET] =
          context.cookies.get?.(name, { signed: false }) ||
          context.cookies[name] ||
          '';
        if (context[_CSRF_SECRET]) {
          break;
        }
      }
    }
    return context[_CSRF_SECRET];
  }

  getInputToken(context, request) {
    const { headerName, bodyName, queryName } = this.security.csrf;
    return (
      context.query?.[queryName] ||
      request.body?.[bodyName] ||
      (headerName && context.get(headerName))
    );
  }

  private checkCSRFToken(context, request) {
    const tokenSecret = this.getCSRFSecret(context);
    if (!tokenSecret) {
      throw new CSRFError('missing csrf token');
    }
    const token = this.getInputToken(context, request);
    if (token !== tokenSecret && !tokens.verify(tokenSecret, token)) {
      throw new CSRFError('invalid csrf token');
    }
  }

  private checkCSRFReferer(context, request) {
    const { refererWhiteList } = this.security.csrf;
    const referer = (context.get('referer') || '').toLowerCase();
    if (!referer) {
      throw new CSRFError('missing csrf referer');
    }

    const host = parseUrl(referer, 'host');
    const domainList = refererWhiteList.concat(request.host);
    if (!host || !isSafeDomain(host, domainList)) {
      throw new CSRFError('invalid csrf referer');
    }
  }

  private ensureCsrfSecret(context, request, response, rotate?) {
    const tokenSecret = this.getCSRFSecret(context);
    if (tokenSecret && !rotate) {
      return;
    }
    const secret = tokens.secretSync();
    context[NEW_CSRF_SECRET] = secret;
    const { useSession, sessionName, cookieDomain } = this.security.csrf;
    let { cookieName } = this.security.csrf;

    if (useSession) {
      context.session[sessionName] = secret;
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
        if (response.cookies?.set) {
          response.cookies.set(name, secret, cookieOpts);
        } else {
          response.cookie(name, secret, cookieOpts);
        }
      }
    }
  }
}
