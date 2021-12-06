import { safeRequire } from '@midwayjs/core';

export function getPassport() {
  return isExpressMode()
    ? require('passport')
    : require('./proxy/index').passport;
}

export function isExpressMode(): boolean {
  return !!(
    process.env['MIDWAY_PASSPORT_MODE'] === 'express' ??
    safeRequire('@midwayjs/express')
  );
}
