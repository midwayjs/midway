import { MidwayCommonError } from '@midwayjs/core';
import { GetHealthServiceOptions } from './interface';

export function isObjectError(obj: any) {
  return obj && typeof obj === 'object' && 'errno' in obj;
}

export function formatObjectErrorToError(obj: any) {
  const err = new Error(obj.message) as any;
  err.stack = obj.stack;
  err.errno = obj.errno;
  for (const key in obj) {
    if (key !== 'errno' && key !== 'stack') {
      err[key] = obj[key];
    }
  }
  const commonErr = new MidwayCommonError(obj.message);
  err.cause = commonErr;
  return commonErr;
}

/**
 * 对于 1 万个不同 ServiceOptions 组合，使用当前这个基于 DJB2 + base36 的方法，冲突概率大约是 0.1%，也就是理论上每 1 万个中只有 10 个左右可能冲突，而且这还是在完全随机分布的情况下估算的
 * 适用于对象类型是扁平的，没有嵌套
 *
 * @param options
 * @returns
 */
export function hashServiceOptions(options: GetHealthServiceOptions): string {
  const keys = Object.keys(options).sort();
  let str = '';
  for (const key of keys) {
    const value = (options as any)[key];
    str += `${key}:${String(value)}|`;
  }

  // 简单快速 hash 算法（DJB2 改进）
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  return (hash >>> 0).toString(36); // 无符号，base36 更短
}
