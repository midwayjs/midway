import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';
import { parse } from 'platform';
import { nanoid } from 'nanoid/non-secure';
const HEADER = ['x-content-security-policy', 'content-security-policy'];
const REPORT_ONLY_HEADER = [
  'x-content-security-policy-report-only',
  'content-security-policy-report-only',
];

const NONCE = Symbol('midway-security#NONCE');

@Middleware()
export class CSPMiddleware extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    Object.defineProperty(context, 'nonce', {
      get: () => {
        if (!context[NONCE]) {
          context[NONCE] = (nanoid as any)(16);
        }
        return context[NONCE];
      },
    });
    const result = await next();
    let finalHeader;
    let value;
    const { policy = {}, reportOnly, supportIE } = this.security.csp;
    const isIE = parse(req.header['user-agent']).name === 'IE';
    const bufArray = [];

    const headers = reportOnly ? REPORT_ONLY_HEADER : HEADER;
    if (isIE && supportIE) {
      finalHeader = headers[0];
    } else {
      finalHeader = headers[1];
    }

    for (const key in policy) {
      value = policy[key];
      value = Array.isArray(value) ? value : [value];

      switch (key) {
        case 'sandbox':
          if (value[0] === true) {
            bufArray.push(key);
          }
          break;

        default:
          if (key === 'script-src') {
            const hasNonce = value.find(val => {
              return val.includes('nonce-');
            });
            if (!hasNonce) {
              value.push(`'nonce-${context.nonce}'`);
            }
          }
          value = value.map(d => {
            if (d.startsWith('.')) {
              d = '*' + d;
            }
            return d;
          });
          bufArray.push(key + ' ' + value.join(' '));
          break;
      }
    }
    const headerString = bufArray.join(';');
    res.set(finalHeader, headerString);
    res.set('x-csp-nonce', context.nonce);
    return result;
  }
}
