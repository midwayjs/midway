---
title: 跨域 CORS
---

在 Midway Hooks 中，可以通过 [@koa/cors](https://github.com/koajs/cors) 来配置跨域功能。

## 使用方法

安装 `@koa/cors` 依赖。

```
npm install @koa/cors
```

在 `configuration.ts` 启用 `@koa/cors` 中间件。

```ts
import {
  createConfiguration,
  hooks,
} from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
import cors from '@koa/cors';

export default createConfiguration({
  imports: [
    Koa,
    hooks({
      // highlight-start
      middleware: [
        cors({ origin: '*' }),
      ],
      // highlight-end
    }),
  ],
});
```

支持的[配置项](https://github.com/koajs/cors#corsoptions)如下：

```javascript
/**
 * CORS middleware
 *
 * @param {Object} [options]
 *  - {String|Function(ctx)} origin `Access-Control-Allow-Origin`, default is request Origin header
 *  - {String|Array} allowMethods `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
 *  - {String|Array} exposeHeaders `Access-Control-Expose-Headers`
 *  - {String|Array} allowHeaders `Access-Control-Allow-Headers`
 *  - {String|Number} maxAge `Access-Control-Max-Age` in seconds
 *  - {Boolean|Function(ctx)} credentials `Access-Control-Allow-Credentials`, default is false.
 *  - {Boolean} keepHeadersOnError Add set headers to `err.header` if an error is thrown
 * @return {Function} cors middleware
 * @api public
 */
```
