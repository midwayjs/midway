import { MidwayCommonError } from '@midwayjs/core';

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
