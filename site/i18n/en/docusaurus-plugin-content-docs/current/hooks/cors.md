# Cross-domain CORS

In Midway Hooks, you can use [@koa/cors](https://github.com/koajs/cors) to configure the cross-border function.

## Usage

Install the `@koa/cors` dependency.

```
npm install @koa/cors
```

Enable `@koa/cors` middleware in `configuration.ts`.

```ts
import {
  createConfiguration
  hooks
} from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
import cors from '@koa/cors';

export default createConfiguration({
  imports: [
    Koa
    hooks({
      // highlight-start
      middleware: [
        cors({ origin: '*' })
      ],
      // highlight-end
    }),
  ],
});
```

The following [Configuration Items](https://github.com/koajs/cors#corsoptions) are supported:

```javascript
/**
 * CORS middleware
 *
 * @param {Object} [options]
 * - {String|Function(ctx)} origin 'Access-Control-Allow-Origin', default is request Origin header
 * - {String|Array} allowMethods 'Access-Control-Allow-Methods', default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
 * - {String|Array} exposeHeaders 'Access-Control-Expose-Headers'
 * - {String|Array} allowHeaders 'Access-Control-Allow-Headers'
 * - {String|Number} maxAge 'Access-Control-Max-Age' in seconds
 * - {Boolean|Function(ctx)} credentials 'Access-Control-Allow-Credentials', default is false.
 * - {Boolean} keepHeadersOnError Add set headers to 'err.header' if an error is thrown
 * @return {Function} cors middleware
 * @api public
 */
```
