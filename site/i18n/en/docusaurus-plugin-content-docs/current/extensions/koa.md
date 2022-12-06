# Koa

Koa is a very lightweight and easy-to-use Web framework. The content of this chapter mainly introduces how to use Koa as the upper-level framework in Midway and use its own capabilities.

Midway's default examples are based on this package.

The `@midwayjs/koa` package uses `koa @2` and integrates `@koa/router` as the basic routing capability by default, and has built-in `session` and `body-parser` functions by default.

| Description |      |
| -------------- | ---- |
| Contains independent main framework | ✅ |
| Contains independent logs | ✅ |



## Installation dependency

```bash
$ npm i @midwayjs/koa@3 --save
$ npm i @types/koa --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/koa": "^3.0.0",
    // ...
  },
  "devDependencies": {
    "@types/koa": "^2.13.4 ",
    // ...
  }
}
```

Examples can also be created directly using scaffolding.

```bash
# npm v6
$ npm init midway --type=koa-v3 my_project

# npm v7
$ npm init midway -- --type=koa-v3 my_project
```



## Enable component

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

@Configuration({
  imports: [koa]
  importConfigs: [join(__dirname, './config')]
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

`@midwayjs/koa` has its own `bodyParser` function, which will parse `Post` requests by default and automatically recognize `json` and `form` types.

If you need text or xml, you can configure it yourself.

The default size is limited to `1mb`. You can set the size of each item separately.

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    enableTypes: ['json', 'form', 'text', 'xml']
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    xmlLimit: '1mb',
  },
}
```

Note that the type selection when using Postman for Post requests:

![postman](https://img.alicdn.com/imgextra/i4/O1CN01QCdTsN1S347SuzZU5_!!6000000002190-2-tps-1017-690.png)

Disable bodyParser middleware。

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

## Cookie and Session

`@midwayjs/koa` encapsulates `cookies` parsing and `Session` support by default. You can view [Cookies and Session](../cookie_session).



## Extended Context

In some scenarios, the Context needs to be expanded.

If you want to hang some temporary request-related object data, you can use the `ctx.setAttr(key, value)` API to implement it, such as the data used by the component.

If you really want to extend the Context, you can use koa's own API.

For example, we extend in `configuration.ts` to provide a `render()` method.

```typescript
import { App, Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

@Configuration({
	// ...
})
export class AutoConfiguration {
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

However, this cannot directly allow the Context to include Typescript Definitions. Additional definitions are required. Please refer to [extended context definitions](../context_definition).



## Configuration



### Default configuration

The configuration sample of `@midwayjs/Koa` is as follows:

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 7001
  },
}
```

All attributes are described as follows:

| Property | Type | Description |
| ------------ | ----------------------------------------- | ------------------------------------------------------- |
| port | Number | Optional, port to start |
| globalPrefix | string | optional. the global http prefix |
| keys | string[] | Optional, Cookies signature, if the upper layer does not write keys, you can also set it here |
| hostname | string | Optional. The hostname to listen to. Default 127.1 |
| Key | string \| Buffer \| Array<Buffer\|Object> | Optional, Https key, server private key |
| cert | string \| Buffer \| Array<Buffer\|Object> | Optional, Https cert, server certificate |
| ca | string \| Buffer \| Array<Buffer\|Object> | Optional, Https ca |
| http2 | boolean | Optional, supported by http2, default false |
| proxy | boolean | Optional. Whether to enable the proxy. If true, the host / protocol / ip in the request request is obtained from the X-Forwarded-Host / X-Forwarded-Proto / X-Forwarded-For in the Header field. The default value is false |
| subdomainOffset | number | optional, the offset of the subdomain name, default 2. |
| proxyIpHeader | string | optional. obtains the field name of the proxy ip address. the default value is X-Forwarded-For |
| maxIpsCount | number | optional. the maximum number of ips obtained, which is 0 by default. |
| serverTimeout | number | Optional, server-side timeout configuration, unit seconds. |


### Modify port

By default, we provide the `7001` default port parameter in `config.default`. by modifying it, we can modify the default port of koa http service.

For example, we changed it to `6001`:

```typescript
// src/config/config.default
export default {
  // ...
  koa: {
    port: 6001
  },
}
```

By default, our port configuration is `null` because the single-test environment requires supertest to start the port.

```typescript
// src/config/config.unittest
export default {
  // ...
  koa: {
    port: null
  },
}
```

In addition, you can also temporarily modify the port by `midway-bin dev-ts-port = 6001`, which overwrites the configured port.



### Global prefix

For more information about this feature, see [Global Prefixes](../controller# Global Routing Prefix).



### Https configuration

In most cases, please use external agents as much as possible to complete the implementation of Https, such as Nginx.

In some special scenarios, you can directly turn on Https by configuring SSL certificates (TLS certificates).

First, you must prepare certificate files in advance, such as `ssl.key` and `ssl.pem`. The key is the private key of the server and the pem is the corresponding certificate.

Then configure it.

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  koa: {
    key: join(__dirname, '../ssl/ssl.key')
    cert: join(__dirname, '../ssl/ssl.pem')
  },
}
```



### favicon settings

By default, the browser will initiate a request to `favicon.ico`.

The framework provides a default middleware to handle the request, and you can specify a `favicon` Buffer.

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  siteFile: {
    favicon: readFileSync(join(__dirname, '../static/fav.ico'))
  },
}
```

If the `@midwayjs/static-file` component is turned on, static file hosting of the component will be preferred.

Disable middleware。

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

### Modify context log

The context log of the koa framework can be modified separately.

```typescript
export default {
  koa: {
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      return '${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}';
    }
    // ...
  },
};
```
