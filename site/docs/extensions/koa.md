# Koa

Koa 是一个非常轻量易用的 Web 框架。本章节内容，主要介绍在 Midway 中如何使用 Koa 作为上层框架，并使用自身的能力。

Midway 默认的示例都是基于该包。

`@midwayjs/koa` 包默认使用 `koa@2` 以及集成了 `@koa/router` 作为路由基础能力，并默认内置了 `session` 和 `body-parser` 功能。

| 描述           |      |
| -------------- | ---- |
| 包含独立主框架 | ✅    |
| 包含独立日志   | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/koa@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/koa": "^3.0.0",
    // ...
  },
}
```

也可以直接使用脚手架创建示例。

```bash
# npm v6
$ npm init midway --type=koa-v3 my_project

# npm v7
$ npm init midway -- --type=koa-v3 my_project
```



## 开启组件

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

@Configuration({
  imports: [koa],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
		// ...
  }
}

```



## BodyParser

`@midwayjs/koa` 自带  `bodyParser` 功能，默认会解析 `Post` 请求，自动识别 `json` 和 `form` 类型。

如需 text 或者 xml，可以自行配置。

默认的大小限制为 `1mb`，可以单独对每项配置大小。

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    enableTypes: ['json', 'form', 'text', 'xml'],
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    xmlLimit: '1mb',
  },
}
```

注意，使用 Postman 做 Post 请求时的类型选择：

![postman](https://img.alicdn.com/imgextra/i4/O1CN01QCdTsN1S347SuzZU5_!!6000000002190-2-tps-1017-690.png)


关闭 bodyParser 中间件。

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    enable: false,
    // ...
  },
}
```


## Cookie 和 Session

`@midwayjs/koa` 默认封装了 `cookies` 解析和 `Session` 的支持，可以查看 [Cookies 和 Session](../cookie_session)。



## 扩展 Context

在一些场景下，需要对 Context 做扩展。

如果希望挂在一些临时的请求相关的对象数据，可以使用 `ctx.setAttr(key, value)` API 来实现，比如组件里自用的数据。

如果实在有扩展 Context 的诉求，可以使用 koa 自带的 API。

比如，我们在 `configuration.ts` 中做扩展提供了一个 `render()` 方法。

```typescript
import { App, Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
	// ...
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady(container) {
    Object.defineProperties(app.context, {
      render: {
        value: async function (...args) {
          // ...
        },
      },
    });
  }
}
```

但是这样做无法直接让 Context 包含 Typescript 定义，需要额外增加定义，请参考 [扩展上下文定义](../context_definition)。



## 获取 Http Server

在一些特殊情况下，你需要获取到原始的 Http Server，我们可以在服务器启动后获取。

```typescript
import { App, Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';

@Configuration({
	// ...
})
export class MainConfiguration {
  @Inject()
  framework: koa.Framework;

  async onServerReady(container) {
    const server = this.framework.getServer();
    // ...
  }
}
```



## State 类型定义

在 koa 的 Context 中有一个特殊的 State 属性，通过和 Context 类似的方式可以扩展 State 定义。

```typescript
// src/interface.ts

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    abc: string;
  }

  interface State{
    bbb: string;
    ccc: number;
  }
}
```





## 配置



### 默认配置

`@midwayjs/koa` 的配置样例如下：

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 7001,
  },
}
```

所有属性描述如下：

| 属性         | 类型                                      | 描述                                                    |
| ------------ | ----------------------------------------- | ------------------------------------------------------- |
| port         | number                                    | 可选，启动的端口                                        |
| globalPrefix | string                                    | 可选，全局的 http 前缀                                  |
| keys         | string[]                                  | 可选，Cookies 签名，如果上层未写 keys，也可以在这里设置 |
| hostname     | string                                    | 可选，监听的 hostname，默认 127.1                       |
| key          | string \| Buffer \| Array<Buffer\|Object> | 可选，Https key，服务端私钥                             |
| cert         | string \| Buffer \| Array<Buffer\|Object> | 可选，Https cert，服务端证书                            |
| ca           | string \| Buffer \| Array<Buffer\|Object> | 可选，Https ca                                          |
| http2        | boolean                                   | 可选，http2 支持，默认 false                            |
| proxy        | boolean                                   | 可选，是否开启代理，如果为 true 则对于 request 请求中的 ip 优先从 Header 字段中 X-Forwarded-For 获取，默认 false           |
| subdomainOffset        | number                                   | 可选，子域名的偏移量，默认 2                            |
| proxyIpHeader        | string                                   | 可选，获取代理 ip 的字段名，默认为 X-Forwarded-For |
| maxIpsCount        | number                                   | 可选，获取的 ips 最大数量，默认为 0（全部返回）|
| serverTimeout | number | 可选，服务端超时配置，默认为 2 * 60 * 1000（2 分钟），单位毫秒 |



### 修改端口

默认情况下，我们在 `config.default` 提供了 `7001` 的默认端口参数，修改它就可以修改 koa http 服务的默认端口。

比如我们修改为 `6001`：

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 6001,
  },
}
```

默认情况下，单测环境由于需要 supertest 来启动端口，我们的 port 配置为 `null`。

```typescript
// src/config/config.unittest
export default {
  // ...
  koa: {
    port: null,
  },
}
```

此外，也可以通过 `midway-bin dev --ts --port=6001` 的方式来临时修改端口，此方法会覆盖配置中的端口。



### 全局前缀

此功能请参考 [全局前缀](../controller#全局路由前缀)。



### 反向代理配置

如果使用了 Nginx 等反向代理，请开启 `proxy` 配置。

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    proxy: true,
  },
}
```

默认使用 `X-Forwarded-For` Header，如果代理配置不同，请自行配置不同的 Header。

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    proxy: true,
    proxyIpHeader: 'X-Forwarded-Host'
  },
}
```





### Https 配置

在大多数的情况，请尽可能使用外部代理的方式来完成 Https 的实现，比如 Nginx。

在一些特殊场景下，你可以通过配置 SSL 证书（TLS 证书）的方式，来直接开启 Https。

首先，你需要提前准备好证书文件，比如 `ssl.key` 和 `ssl.pem`，key 为服务端私钥，pem 为对应的证书。

然后配置即可。

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  koa: {
    key: join(__dirname, '../ssl/ssl.key'),
    cert: join(__dirname, '../ssl/ssl.pem'),
  },
}
```



### favicon 设置

默认情况下，浏览器会发起一个 `favicon.ico` 的请求。

框架提供了一个默认中间件，用来处理该请求，你可以指定一个 `favicon` 的 Buffer。

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  siteFile: {
    favicon: readFileSync(join(__dirname, '../static/fav.ico')),
  },
}
```

如果开启了 `@midwayjs/static-file`  组件，那么会优先使用组件的静态文件托管。

关闭中间件。

```typescript
// src/config/config.default
export default {
  // ...
  siteFile: {
    enable: false,
    // ...
  },
}
```

### 修改上下文日志

可以单独修改 koa 框架的上下文日志。

```typescript
export default {
  koa: {
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
    }
    // ...
  },
};
```



### Query 数组解析

默认情况下，koa 使用 `querystring` 解析 query 参数，当碰到数组时，会将数组的数据拆开。

比如：

```
GET /query?a[0]=1&a[1]=2
```

拿到的结果是：

```json
{
    "a[0]": 1,
    "a[1]": 2,
}
```

框架提供了一些参数来处理这种情况。

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    queryParseMode: 'extended',
    // ...
  },
}
```

`queryParseMode` 参数可以选择 `extended`、 `strict`、`first` 三种值。

 当 `queryParseMode` 有值时，会使用 `qs` 模块处理 query，效果同 `koa-qs` 模块。

当请求参数为 `/query?a=1&b=2&a=3&c[0]=1&c[1]=2'` 时。

默认效果（使用 `querystring`）

```JSON
{
  "a": ["1", "3" ],
  "b": "2",
  "c[0]": "1",
  "c[1]": "2"
}
```

 `extended` 效果

```JSON
{
  "a": ["1", "3" ],
  "b": ["2"],
  "c": ["1", "2"]
}
```

 `strict` 效果

```JSON
{
  "a": ["1", "3" ],
  "b": "2",
  "c": ["1", "2"]
}
```

 `first` 效果

```JSON
{
  "a": "1",
  "b": "2",
  "c": "1"
}
```

