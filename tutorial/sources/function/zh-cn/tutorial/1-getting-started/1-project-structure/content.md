---
type: lesson
title: 项目结构介绍
focus: /README.md
editor:
  fileTree:
    allowEdits: false
terminal: false
previews: false
---

# 理解 Midway 项目结构

让我们先了解一下 Midway 应用的基本结构。

## 目录说明

```
my_midway_app/
├── src/                          # 源码目录
│   ├── controller/               # 控制器目录
│   │   └── home.controller.ts    # 主页控制器
│   ├── service/                  # 服务目录
│   ├── config/                   # 配置目录
│   │   └── config.default.ts     # 默认配置
│   └── configuration.ts          # 应用配置
├── bootstrap.js                  # 启动文件
├── package.json                  # 项目配置
└── tsconfig.json                 # TypeScript 配置
```

## 核心文件说明

### 1. bootstrap.js - 启动文件
应用的入口文件，负责启动 Midway 框架。

### 2. configuration.ts - 配置入口
定义应用使用哪些组件、配置等。

### 3. controller/ - 控制器目录
存放 Web 请求处理逻辑，负责接收请求并返回响应。

### 4. service/ - 服务目录
存放业务逻辑，提供可复用的服务。

### 5. config/ - 配置目录
存放应用配置文件，如端口号、数据库连接等。

## 查看代码

让我们查看每个核心文件的内容：

### bootstrap.js - 启动文件

```javascript title="bootstrap.js"
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap.run();
```

这是应用的入口文件，负责启动 Midway 框架。

### src/configuration.ts - 应用配置

```typescript title="src/configuration.ts"
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as defaultConfig from './config/config.default';

@Configuration({
  imports: [koa],
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // 应用启动完成后执行
  }
}
```

这个文件定义了应用使用哪些组件和配置。

### src/controller/home.controller.ts - 控制器

```typescript title="src/controller/home.controller.ts"
import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
```

第一个控制器，处理根路径的 GET 请求。

### src/config/config.default.ts - 配置文件

```typescript title="src/config/config.default.ts"
export default {
  keys: '123456',
  koa: {
    port: 7001,
  },
};
```

应用的基础配置，包括端口号等信息。

## 开发习惯

Midway 鼓励按功能组织代码，常用的目录还包括：

- `middleware/` - 中间件
- `filter/` - 过滤器
- `service/` - 服务逻辑
- `entity/` 或 `model/` - 数据库实体
- `util/` - 工具函数
- `decorator/` - 自定义装饰器

## 下一步

现在您已经了解了项目结构，让我们创建第一个控制器！
