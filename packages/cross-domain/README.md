## Cross-domain 跨域组件

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用跨域组件，支持 `cors` 、`jsonp` 多种模式。

### Usage

1. 安装依赖
```shell
tnpm i @midwayjs/cross-domain --save
```
2. 在 configuration 中引入组件,
```ts
import * as crossDomain from '@midwayjs/cross-domain';
@Configuration({
  imports: [
    // ...other components
    crossDomain
  ],
})
export class AutoConfiguration {}
```



### CORS 配置
```ts
export const cors = {
  allowMethods: string |string[];
  origin: string|Function;
  exposeHeaders: string |string[];
  allowHeaders: string |string[];
  credentials: boolean|Function;
  keepHeadersOnError: boolean;
  maxAge: number;
}
```


### JSONP 配置
```ts
export const jsonp = {
  callback: 'jsonp',
  limit: 512,
}
```
