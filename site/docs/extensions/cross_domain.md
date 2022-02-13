# 跨域

适用于 `@midwayjs/faas` 、`@midwayjs/web` 、`@midwayjs/koa` 和 `@midwayjs/express` 多种框架的通用跨域组件，支持 `cors` 、`jsonp` 多种模式。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ✅    |
| 可用于一体化      | ✅    |


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
export class AutoConfiguration {}
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
  allowMethods: string |string[];
  origin: string|Function;
  exposeHeaders: string |string[];
  allowHeaders: string |string[];
  credentials: boolean|Function;
  keepHeadersOnError: boolean;
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
