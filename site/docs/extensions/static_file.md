# 静态文件托管

midway 提供了基于 [koa-static-cache](https://github.com/koajs/static-cache) 模块的静态资源托管组件。

相关信息：

| web 支持情况      |      |
| ----------------- | ---- |
| @midwayjs/koa     | ✅    |
| @midwayjs/faas    | 💬    |
| @midwayjs/web     | ✅    |
| @midwayjs/express | ❌    |

:::caution

💬 部分函数计算平台不支持流式请求响应，请参考对应平台能力。

:::



## 安装依赖

```bash
$ npm i @midwayjs/static-file@3 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

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



## 引入组件


首先，引入 组件，在 `configuration.ts` 中导入：

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import { join } from 'path'

@Configuration({
  imports: [
    koa,
    staticFile
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class MainConfiguration {
}
```



## 使用

默认情况下，会托管项目根目录下的 `public` 目录中的内容。

比如：

```
➜  my_midway_app tree
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

我们可以直接使用路径访问 `GET /public/index.html` 并获取相应的结果。



## 配置

### 修改默认行为

资源的托管使用的是 `dirs` 字段，其中有一个 `default` 属性，我们可以修改它。

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

`dirs` 中的对象值，会和 `staticFile` 下的值合并后，传入 `koa-static-cache` 中间件中。

### 增加新的目录

可以对 dirs 做修改，增加一个新的目录。key 不重复即可，value 会和默认的配置合并。

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



### 可用配置

支持所有的 [koa-static-cache](https://github.com/koajs/static-cache) 配置，默认配置如下：

| 属性名  | 默认值                                               | 描述                                                         |
| ------- |---------------------------------------------------| ------------------------------------------------------------ |
| dirs    | \{"default": \{prefix: "/public", "dir": "xxxx"}} | 托管的目录，为了支持多个目录，是个对象。<br />除了 default 之外，其他的 key 可以随意添加，dirs 中的对象值会和外部默认值做合并 |
| dynamic | true                                              | 动态加载文件，而不是在初始化读取后做缓存                     |
| preload | false                                             | 是否在初始化缓存                                             |
| maxAge  | prod 为 31536000，其他为 0                             | 缓存的最大时间                                               |
| buffer  | prod 为 true，其余为 false                             | 使用 buffer 字符返回                                         |

更多配置，请参考 [koa-static-cache](https://github.com/koajs/static-cache) 。



## 常见问题

### 1、函数下路由未生效

函数路由需要显式配置才能生效，一般来说，会添加一个通配的路由用于静态文件，如 `/*`，或者 `/public/*`。

```typescript
import {
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloHTTPService {

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/public/*',
    method: 'get',
  })
  async handleStaticFile() {
    // 这个函数可以没有方法体，只是为了让网关注册一个额外的路由
  }
}

```



### 2、默认 index.html

由于  [koa-static-cache](https://github.com/koajs/static-cache)  不支持默认 `index.html` 的配置，可以通过它的 alias 功能来解决。

可以配置把 `/` 指向到 `/index.html` 即可，不支持通配和正则。

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



### 3、egg（@midwayjs/web）下不生效的情况

由于 egg  自带了静态托管插件，如果开启了 static 插件，会和此组件冲突。

如需使用本组件，请务必关闭 egg 插件。

```typescript
// src/config/plugin.ts
import { EggPlugin } from 'egg';
export default {
  // ...
  static: false,
} as EggPlugin;
```

### 4、Internal Server Error, real status: 500

如果使用staticFile配置的静态目录不存在，则服务可能会抛出500错误，请确保您配置的静态目录已被正确创建。
