---
title: 跨域 CORS
---

跨源资源共享([CORS](https://developer.mozilla.org/zh-CN/docs/Glossary/CORS)) （或通俗地译为跨域资源共享）是一种基于[HTTP](https://developer.mozilla.org/zh-CN/docs/Glossary/HTTP)头的机制，该机制通过允许服务器标示除了它自己以外的其它 [origin](https://developer.mozilla.org/zh-CN/docs/Glossary/Origin)（域，协议和端口），这样浏览器可以访问加载这些资源。

简单来说，CORS 的设置会影响前端请求跨域资源。

## 在 @midwayjs/web 使用

安装 egg-cors。

```bash
$ npm i egg-cors --save 
```

配置插件启用

```typescript
// src/config/plugin.ts
exports.cors = {
  enable: true,
  package: 'egg-cors',
};
```

配置 cors 插件。

```typescript
// src/config/config.default.ts
export const cors = {
  // {string|Function} origin: '*',
  // {string|Array} allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
};
```

如果只想特定域名，需要在 security 插件处配置。

```typescript
// src/config/config.default.ts
export const security = {
  domainWhiteList: ['http://localhost:4200'], //  允许跨域的域名
};
```

具体请参考 [cors 文档](https://github.com/eggjs/egg-cors)。

## 在 @midwayjs/koa 使用

koa 当前使用 [@koa/cors](https://github.com/koajs/cors) 包来做。

```bash
$ npm i @koa/cors --save
```

然后在 `configuration.ts` 中直接加入中间件即可。

```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import * as cors from '@koa/cors';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }
}
```

更多配置，请参考 [@koa/cors 文档](https://github.com/koajs/cors)。

## 在 @midwayjs/express 使用

使用 cors 包。

```bash
$ npm install cors --save
```

然后在 `configuration.ts` 中直接加入中间件即可。

```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/express';
import * as cors from 'cors';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }
}
```

更多配置，请参考 [cors 文档](https://expressjs.com/en/resources/middleware/cors.html)。

## 在 Serverless 场景使用

**在 FC 的 HTTP 触发器下，无需配置 cors，网关自动支持 OPTIONS。**

其余平台或者触发器，可以适当使用下面的代码。

函数的 CORS 可以复用 koa 的 CORS 能力。

```bash
$ npm i @koa/cors --save
```

然后在 `configuration.ts` 中直接加入中间件即可。

```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/faas';
import * as cors from '@koa/cors';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }
}
```

更多配置，请参考 [@koa/cors 文档](https://github.com/koajs/cors)。
