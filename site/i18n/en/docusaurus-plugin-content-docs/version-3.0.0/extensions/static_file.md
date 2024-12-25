# Static file hosting

midway provides static resource hosting components based on the [koa-static-cache](https://github.com/koajs/static-cache) module.

Related information:

| Web support |      |
| ----------------- | ---- |
| @midwayjs/koa | ✅ |
| @midwayjs/faas | 💬 |
| @midwayjs/web | ✅ |
| @midwayjs/express | ❌ |

:::caution

💬 Some function computing platforms do not support streaming request responses. Please refer to the corresponding platform capabilities.

:::

## Installation dependency

```bash
$ npm i @midwayjs/static-file@3 --save
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/static-file": "^3.0.0",
    // ...
  },
  "devDependencies": {
    // ...
  }
}
```



## Introducing components


First, introduce components and import them in `configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import { join } from 'path'

@Configuration({
  imports: [
    koa
    staticFile
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```



## Use

By default, the `public` directory in the root directory of the project is hosted.

For example:

```
➜ my_midway_app tree
.
├── src
├── public
|   ├── index.html
│   └── hello.js
│
├── test
├── package.json
└── tsconfig.json
```

You can directly use the path to access `GET /public/index.html` and obtain the corresponding results.



## Configuration

### Modify default behavior

The hosting of the resource uses the `dirs` field, which has a `default` attribute that we can modify.

```typescript
// {app_root}/src/config/config.default.ts
export default {
  // ...
  staticFile: {
    dirs: {
      default: {
        prefix: '/',
        dir: 'xxx',
      },
    }
  },
}
```

The value of the object in `dirs` is merged with the value under the `staticFile` and passed into the `koa-static-cache` middleware.

### Add a new directory

You can modify dirs and add a new directory. the key is not repeated, and the value is merged with the default configuration.

```typescript
// {app_root}/src/config/config.default.ts
export default {
  // ...
  staticFile: {
    dirs: {
      default: {
        prefix: '/',
        dir: 'xxx',
      },
      another: {
        prefix: '/',
        dir: 'xxx',
      },
    }
    // ...
  },
}
```



### Available configuration

All [koa-static-cache](https://github.com/koajs/static-cache) configurations are supported. The default configuration is as follows:

| Property | Default | Description |
| ------- |---------------------------------------------------| ------------------------------------------------------------ |
| dirs | \{"default": \{prefix: "/public", "dir": "xxxx"}} | Managed directories, in order to support multiple directories, are objects. <br />In addition to the default, other keys can be added at will, and the object values in dirs will be merged with the external default values |
| dynamic | true | Load files dynamically instead of caching after initialization reading |
| preload | false | Whether the cache is being initialized |
| maxAge | prod is 31536000, others are 0 | Maximum cache time |
| buffer | prod is true and the rest is false | Use buffer character to return |

For more configuration, please refer to [koa-static-cache](https://github.com/koajs/static-cache) .



## Frequently Asked Questions

### 1. The route under the function does not take effect

Function routes need to be explicitly configured to take effect. Generally, a wildwith route is added for static files, such as `/*` or `/public/*`.

```typescript
import {
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType
} from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloHTTPService {

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/public/*',
    method: 'get',
  })
  async handleStaticFile() {
    // This function can have no method body, just to let the gateway register an additional route
  }
}

```



### 2. Default index.html

Since [koa-static-cache](https://github.com/koajs/static-cache) does not support the default `index.html` configuration, it can be solved by its alias function.

You can configure `/` to point to `/index.html`. Wildcards and regular expressions are not supported.

```typescript
export default {
   // ...
   staticFile: {
     dirs: {
       default: {
         prefix: '/',
         alias: {
           '/': '/index.html',
         },
       },
     },
     // ...
   },
}
```



### 3. When egg (@midwayjs/web) does not take effect

Since egg comes with a static hosting plug-in, if the static plug-in is enabled, it will conflict with this component.

If you want to use this component, be sure to close the egg plug-in.

```typescript
// src/config/plugin.ts
import { EggPlugin } from 'egg';
export default {
   // ...
   static: false,
} as EggPlugin;
```
