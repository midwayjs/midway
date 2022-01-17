# Koa

Koa 是一个非常轻量易用的 Web 框架。本章节内容，主要介绍在 Midway 中如何使用 Koa 作为上层框架，并使用自身的能力。

Midway 默认的示例都是基于该包。

`@midwayjs/koa` 包默认使用 `koa@2` 以及集成了 `@koa/router` 作为路由基础能力，并默认内置了 `session` 和 `body-parser` 功能。

## 安装依赖

```bash
$ npm i @midwayjs/koa --save
$ npm i @types/koa --save-dev
```



## 开启组件



```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

@Configuration({
  imports: [koa],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {

  }
}

```





## 配置

`@midwayjs/koa`  的配置样例如下：

```typescript
// src/config/config.default
export const koa = {
  port: 7001
}
```

所有属性描述如下：

| 属性     | 类型                                      | 描述                                              |
| -------- | ------- | ---------------------------- |
| port     | number  | 可选，启动的端口          |
| globalPrefix | string | 可选，全局的 http 前缀 |
| keys     | string[] | 可选，Cookies 签名，如果上层未写 keys，也可以在这里设置 |
| hostname | string  | 可选，监听的 hostname，默认 127.1 |
| key | string \| Buffer \| Array<Buffer\|Object> | 可选，Https key |
| cert | string \| Buffer \| Array<Buffer\|Object> | 可选，Https cert |
| ca | string \| Buffer \| Array<Buffer\|Object> | 可选，Https ca |
| http2    | boolean | 可选，http2 支持，默认 false |

