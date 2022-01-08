---
title: 静态资源（Static File）
---

静态资源一般用来托管前端文件（js/css/html/png）等。
​

## 在 @midwayjs/web 使用

Egg.js 默认提供了 static 插件，只需配置插件启用即可。

```typescript
// src/config/plugin.ts
exports.static = true;
```

egg-static 插件基于 [koa-static-cache](https://github.com/koajs/static-cache) 模块，支持其所有的配置。
​

插件默认的 config 配置为：

```typescript
{
	prefix: '/public/',
  dir: path.join(appInfo.baseDir, 'app/public'),
}
```

`prefix` 表示 URL 路径前缀，dir 表示静态文件存放的位置。比如 `${baseDir}/app/public/a.js` 这个文件，在开启插件后，所访问的 URL 为 `http://127.0.0.1:7001/public/a.js` 。

更多配置，请查看 [koa-static-cache](https://github.com/koajs/static-cache) 文档。

## 在 @midwayjs/koa 使用

和 Egg.js 类似，我们可以直接引入 [koa-static-cache](https://github.com/koajs/static-cache) 模块。

```bash
$ npm i koa-static-cache --save
```

然后在 `configuration.ts` 中直接加入中间件即可。
​

下面的示例，我们将资源目录放到了项目目录下的 public 目录中。

```typescript
// src/configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import * as staticCache from 'koa-static-cache';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      staticCache({
        prefix: '/public/',
        dir: path.join(this.app.getAppDir(), 'public'),
      })
    );
  }
}
```

更多配置，请查看 [koa-static-cache](https://github.com/koajs/static-cache) 文档。

## 在 @midwayjs/express 使用

Express 中自带了 static 的支持，直接在 `configuration.ts` 中直接加入中间件即可。

```typescript
// src/configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/express';
import * as express from 'express';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(express.static('public'));
  }
}
```

现在，可以访问位于 public 目录中的文件：

```typescript
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
```

:::caution
注意：Express 相对于静态目录查找文件，因此静态目录的名称不是此 URL 的一部分。
:::
​

如果你想修改路由，可以通过下面的 API。

```typescript
app.use('/static', express.static(path.join(__dirname, 'public')));
```

更多配置，请参考 [express 文档](https://expressjs.com/en/starter/hello-world.html)。
​

## 在 Serverless 场景使用

Serverless 场景较为特殊，网关不支持流式处理，所以在使用时，需要寻找支持 buffer 返回的库。

[koa-static-cache](https://github.com/koajs/static-cache) 模块支持 buffer 返回。

```bash
$ npm i koa-static-cache --save
```

然后在 `configuration.ts` 中直接加入中间件。

```typescript
// src/configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/faas';
import * as staticCache from 'koa-static-cache';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      staticCache({
        prefix: '/public/',
        dir: join(__dirname, '../public'),
        dynamic: true,
        preload: false,
        buffer: true, // 注意，这里是 true
        maxFiles: 1000,
      })
    );
  }
}
```

在 **非高密度场景**下（普通函数），需要提供一个 `/*` 的路由函数，否则不会进入函数逻辑（自然就走不到中间件中）。
​

比如，为了中间件可进入，我们增加一个空的 `Get /public/*` 的路由即可（写 `public/*` 的目的是防止其他非 public 静态资源的路由走到这个函数）。

```typescript
import { Inject, Provide, Controller， Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class ServerlessHelloService {

  @Inject()
  ctx: Context;

  // 普通路由
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/:user_id',
    method: 'get',
  })
  async hello1() {
    return 22;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/public/*',
    method: 'get',
  })
  async render() {
    // 这个函数的作用是为了让 static 全局中间件被执行。
  }
}
```

更多配置，请参考 [koa-static-cache](https://github.com/koajs/static-cache) 模块文档。
