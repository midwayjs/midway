import { dirname, resolve, sep, extname } from 'path';
import { readFileSync } from 'fs';

export const isDevelopmentEnvironment = env => {
  return ['local', 'test', 'unittest'].includes(env);
};

export const safeRequire = (p, enabledCache = true) => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }
  try {
    if (enabledCache) {
      return require(p);
    } else {
      const content = readFileSync(p, {
        encoding: 'utf-8',
      });
      return JSON.parse(content);
    }
  } catch (err) {
    return undefined;
  }
};

export const isPath = (p): boolean => {
  // eslint-disable-next-line no-useless-escape
  if (/(^[\.\/])|:|\\/.test(p)) {
    return true;
  }
  return false;
};

/**
 *  safelyGet(['a','b'],{a: {b: 2}})  // => 2
 *  safelyGet(['a','b'],{c: {b: 2}})  // => undefined
 *  safelyGet(['a','1'],{a: {"1": 2}})  // => 2
 *  safelyGet(['a','1'],{a: {b: 2}})  // => undefined
 *  safelyGet('a.b',{a: {b: 2}})  // => 2
 *  safelyGet('a.b',{c: {b: 2}})  // => undefined
 */
export function safelyGet(
  list: string | string[],
  obj?: Record<string, unknown>
): any {
  if (arguments.length === 1) {
    return (_obj: Record<string, unknown>) => safelyGet(list, _obj);
  }

  if (typeof obj === 'undefined' || typeof obj !== 'object' || obj === null) {
    return void 0;
  }
  const pathArrValue = typeof list === 'string' ? list.split('.') : list;
  let willReturn: any = obj;

  for (const key of pathArrValue) {
    if (typeof willReturn === 'undefined' || willReturn === null) {
      return void 0;
    } else if (typeof willReturn !== 'object') {
      return void 0;
    }
    willReturn = willReturn[key];
  }

  return willReturn;
}

/**
 * 剔除 @ 符号
 * @param provideId provideId
 */
export function parsePrefix(provideId: string) {
  if (provideId.includes('@')) {
    return provideId.substr(1);
  }
  return provideId;
}

export function isPathEqual(one: string, two: string) {
  if (!one || !two) {
    return false;
  }
  const ext = extname(one);
  return one.replace(ext, '') === two;
}

export function getUserHome() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}
