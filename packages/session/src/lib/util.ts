import { crc32 } from './crc';

/**
 * Decode the base64 cookie value to an object.
 *
 * @param {String} string
 * @return {Object}
 * @api private
 */
export function decode(string) {
  const body = Buffer.from(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

/**
 * Encode an object into a base64-encoded JSON string.
 *
 * @param {Object} body
 * @return {String}
 * @api private
 */

export function encode(body) {
  body = JSON.stringify(body);
  return Buffer.from(body).toString('base64');
}

export function hash(sess): number {
  return crc32(JSON.stringify(sess));
}

export const COOKIE_EXP_DATE = new Date('Thu, 01 Jan 1970 00:00:00 GMT');

export const ONE_DAY = 24 * 60 * 60 * 1000;
