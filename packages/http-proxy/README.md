## HTTP 代理组件

HTTP 代理组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的 HTTP 代理组件，支持GET、POST等多种请求方法。

### Usage

1. 安装依赖
```bash
$ npm i @midwayjs/http-proxy --save
```
2. 在 configuration 中引入组件,
```ts
import * as proxy from '@midwayjs/http-proxy';
@Configuration({
  imports: [
    // ...other components
    proxy
  ],
})
export class AutoConfiguration {}
```

### 配置

```ts
export const httpProxy = [
  {
    host: 'http://127.0.0.1',
    match: /\/assets\/(.*)/,
    target: 'http://127.0.0.1/$1',
  }
]
```
