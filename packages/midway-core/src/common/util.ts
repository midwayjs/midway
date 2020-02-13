import { dirname, resolve, sep } from 'path';
import { MAIN_MODULE_KEY } from '../interface';

export const safeRequire = p => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }
  try {
    return require(p);
  } catch (err) {
    return undefined;
  }
};

export const isPath = (p): boolean => {
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
export function safelyGet(list: string | string[], obj?: object): any {
  if (arguments.length === 1) {
    return (_obj: object) => safelyGet(list, _obj);
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
 * 生成带 namespace 的 provideId
 * @param provideId provideId
 * @param namespace namespace
 */
export function generateProvideId(provideId: string, namespace?: string) {
  if (namespace && namespace !== MAIN_MODULE_KEY) {
    if (provideId.includes('@')) {
      return provideId.substr(1);
    }
    if (provideId.includes(':')) {
      return provideId;
    }
    return namespace + ':' + provideId;
  }
  return provideId;
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
