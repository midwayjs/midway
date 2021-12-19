/**
 * koa server options
 */
export const koa = {};

/**
 * The key that signing cookies. It can contain multiple keys seperated by `,`.
 * @member {String} Config#keys
 */
export const keys = '';

/**
 * default cookie options
 *
 * @member Config#cookies
 * @property {String} sameSite - SameSite property, defaults is ''
 * @property {Boolean} httpOnly - httpOnly property, defaults is true
 */
export const cookies = {
  // httpOnly: true | false,
  // sameSite: 'none|lax|strict',
};

export const onerror = {};

/**
 * @member Config#bodyParser
 * @property {Boolean} enable - enable bodyParser or not, default is true
 * @property {String | RegExp | Function | Array} ignore - won't parse request body when url path hit ignore pattern, can not set `ignore` when `match` presented
 * @property {String | RegExp | Function | Array} match - will parse request body only when url path hit match pattern
 * @property {String} encoding - body's encoding type，default is utf8
 * @property {String} formLimit - limit of the urlencoded body. If the body ends up being larger than this limit, a 413 error code is returned. Default is 1mb
 * @property {String} jsonLimit - limit of the json body, default is 1mb
 * @property {String} textLimit - limit of the text body, default is 1mb
 * @property {Boolean} strict - when set to true, JSON parser will only accept arrays and objects. Default is true
 * @property {Number} queryString.arrayLimit - urlencoded body array's max length, default is 100
 * @property {Number} queryString.depth - urlencoded body object's max depth, default is 5
 * @property {Number} queryString.parameterLimit - urlencoded body maximum parameters, default is 1000
 */
export const bodyParser = {
  enable: true,
  encoding: 'utf8',
  formLimit: '1mb',
  jsonLimit: '1mb',
  textLimit: '1mb',
  strict: true,
  // @see https://github.com/hapijs/qs/blob/master/lib/parse.js#L8 for more options
  queryString: {
    arrayLimit: 100,
    depth: 5,
    parameterLimit: 1000,
  },
  onerror(err) {
    err.message += ', check bodyParser config';
    throw err;
  },
};
