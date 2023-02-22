# 跨域

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用跨域组件，支持 `cors` 、`jsonp` 多种模式。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | ✅    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/cross-domain --save
```

## 引入组件

在 `src/configuration.ts` 中引入组件,

```typescript
import * as crossDomain from '@midwayjs/cross-domain';
@Configuration({
  imports: [
    // ...other components
    crossDomain
  ],
})
export class MainConfiguration {}
```


## CORS 配置

可以在 `src/config/config.default` 中进行 CORS 配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  cors: {
    credentials: false,
  },
}
```

可用配置如下：

```typescript
export const cors = {
  // 允许跨域的方法，【默认值】为 GET,HEAD,PUT,POST,DELETE,PATCH
  allowMethods: string |string[];
  // 设置 Access-Control-Allow-Origin 的值，【默认值】会获取请求头上的 origin
  // 也可以配置为一个回调方法，传入的参数为 request，需要返回 origin 值
  // 例如：http://test.midwayjs.org
  // 如果设置了 credentials，则 origin 不能设置为 *
  origin: string|Function;
  // 设置 Access-Control-Allow-Headers 的值，【默认值】会获取请求头上的 Access-Control-Request-Headers
  allowHeaders: string |string[];
  // 设置 Access-Control-Expose-Headers 的值
  exposeHeaders: string |string[];
  // 设置 Access-Control-Allow-Credentials，【默认值】false
   // 也可以配置为一个回调方法，传入的参数为 request，返回值为 true 或 false
  credentials: boolean|Function;
  // 是否在执行报错的时候，把跨域的 header 信息写入到 error 对的 headers 属性中，【默认值】false
  keepHeadersOnError: boolean;
  // 设置 Access-Control-Max-Age
  maxAge: number;
}
```


## JSONP 配置

可以在 `src/config/config.default` 中进行 JSONP 配置。

```typescript
// src/config/config.default.ts
export default {
  // ...
  jsonp: {
    callback: 'jsonp',
    limit: 512,
  },
}
```
