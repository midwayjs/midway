import { Middleware } from '@midwayjs/core';
import { BaseMiddleware } from './base';
import * as escape from 'escape-html';
import xss from 'xss';

@Middleware()
export class SecurityHelper extends BaseMiddleware {
  async compatibleMiddleware(context, req, res, next) {
    context.security = {
      escape,
      html: (htmlCode: string) => xss(htmlCode),
      js: safeJS,
      json: safeJSON,
    };

    return next();
  }
}
const MATCH_VULNERABLE_REGEXP = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/;
const BASIC_ALPHABETS = new Set(
  'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
);
const map = {
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
};
const safeJS = (jsCode: string): string => {
  jsCode = `${jsCode || ''}`;

  const match = MATCH_VULNERABLE_REGEXP.exec(jsCode);

  if (!match) {
    return jsCode;
  }

  let res = '';
  let index = 0;
  let lastIndex = 0;
  let ascii;

  for (index = match.index; index < jsCode.length; index++) {
    ascii = jsCode[index];
    if (BASIC_ALPHABETS.has(ascii)) {
      continue;
    } else {
      if (map[ascii] === undefined) {
        const code = ascii.charCodeAt(0);
        if (code > 127) {
          continue;
        } else {
          map[ascii] = '\\x' + code.toString(16);
        }
      }
    }

    if (lastIndex !== index) {
      res += jsCode.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    res += map[ascii];
  }

  return lastIndex !== index ? res + jsCode.substring(lastIndex, index) : res;
};

function sanitizeKey(obj) {
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj;
  if (obj === null) return null;
  if (obj instanceof Boolean) return obj;
  if (obj instanceof Number) return obj;
  if (obj instanceof Buffer) return obj.toString();
  for (const k in obj) {
    const escapedK = safeJS(k);
    if (escapedK !== k) {
      obj[escapedK] = sanitizeKey(obj[k]);
      obj[k] = undefined;
    } else {
      obj[k] = sanitizeKey(obj[k]);
    }
  }
  return obj;
}

const safeJSON = (object: any): string => {
  return JSON.stringify(sanitizeKey(object), (k, v) => {
    return typeof v === 'string' ? safeJS(v) : v;
  });
};
