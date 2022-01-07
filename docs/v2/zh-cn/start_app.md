---
title: 创建第一个应用
---

## 快速初始化

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=web my_midway_app

# 如果是 npm v7
$ npm init midway -- --type=web my_midway_app
```

`my_midway_app`   是你即将创建的项目根目录名，CLI 会自动创建该目录，并将初始化示例代码写入其中。

流程示例如下（npm7 效果）：

<img src="https://cdn.nlark.com/yuque/0/2021/svg/501408/1617863129019-55f49eaa-4507-4bd5-9481-1e59d6295103.svg#height=776&id=iYjWX&margin=%5Bobject%20Object%5D&name=create.svg&originHeight=776&originWidth=1390&originalType=binary&ratio=1&size=119483&status=done&style=none&width=1390" width="1390" />

:::info
可以使用 `npm init midway`  查看完整的脚手架列表，选中某个项目后，Midway 会自动创建示例目录，代码，以及安装依赖。
:::

<img src="https://cdn.nlark.com/yuque/0/2021/svg/501408/1619947815582-6283808a-b092-439b-b47f-f8a98852d2ed.svg#clientId=ub91e37c7-a0d3-4&from=ui&id=uc666f20c&margin=%5Bobject%20Object%5D&name=create-with-cli.svg&originHeight=928&originWidth=1770&originalType=binary&ratio=1&size=122976&status=done&style=none&taskId=uc9e17831-bc48-4ee0-a3ca-11de139c454" width="undefined" />

**可能会碰到的问题：**

:::caution
1、在 node15/npm7 下执行 `npm install/i` 命令安装依赖可能会有 Python 编译错误

**使用 npm init midway 创建的项目会自动安装依赖，无此问题。**

**解决方案**：npm i 时添加 `--legacy-peer-deps`  参数。
**原因**：测试框架 Jest 依赖 jsdom，npm7 会自动安装其 peerDependencies 中依赖的 canvas 包， 而 canvas 的安装编译需要有 python3 环境。
:::

:::caution
2、在安装依赖时会有 npm warn: deprecated 输出

**原因**：测试框架 Jest 依赖 jsdom，其依赖了已废弃的模块 request，目前 jsdom 尚未解决此问题，我们会持续进行跟踪，相关问题参看：[https://github.com/jsdom/jsdom/issues/2792](https://github.com/jsdom/jsdom/issues/2792)
:::

:::caution
3、windows 可能会碰到 eslint 报错的问题，请关注 [windows 下换行问题](git_problem#XCAgm)。
:::

示例将创建一个类似下面的目录结构，其中最精简的 Midway 项目示例如下。

```
➜  my_midway_app tree
.
├── src                            ## midway 项目源码
│   └── controller                 ## Web Controller 目录
│       └── home.ts
├── test
├── package.json
└── tsconfig.json
```

整个项目包括了一些最基本的文件和目录。

- `src`  整个 Midway 项目的源码目录，你之后所有的开发源码都将存放于此
- `test`  项目的测试目录，之后所有的代码测试文件都在这里
- `package.json`  Node.js 项目基础的包管理配置文件
- `tsconfig.json`  TypeScript 编译配置文件

除了整个目录，我们还有一些其他的目录，比如 `controller`  目录。

## 开发习惯

Midway 对目录没有特别的限制，但是我们会遵守一些简单的开发习惯，将一部分常用的文件进行归类，放到一些默认的文件夹中。

以下 ts 源码文件夹均在 `src`  目录下。

常用的有：

- `controller` Web Controller 目录
- `middleware` Web 中间件目录
- `service` 服务逻辑目录
- `entity`  或 `model`   数据库实体目录
- `config`  业务的配置目录
- `util` 工具类存放的目录
- `interface.ts`  业务的 ts 定义文件

随着不同场景的出现，目录的习惯也会不断的增加，具体的目录内容会体现在不同的框架中。

## Web 框架选择

Midway 设计之初就可以兼容多种上层框架，在 Web 场景默认封装了 Egg.js 作为上层的 Web 框架，同时，Midway 也提供了其他的 Web 框架选择，比如常见的 `Express`  和 `Koa` 。

这些上层框架都可以使用 Midway 提供的装饰器能力，但是 Midway 不会对特有的能力做出封装，比如 Egg.js 的插件体系，或者 Express 的中间件能力，如果你对其中的某个框架比较熟悉，或者希望使用特定框架的能力，就可以选择它作为你的主力 Web 框架。

| 名称              | 描述                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| @midwayjs/web     | 默认，Egg.js 是国内相对常用的 Web 框架，也在阿里的双促中经过稳定性考验，包含了比较多的默认插件。          |
| @midwayjs/express | Express 是一个众所周知的 node.js 简约 Web 框架。 这是一个经过实战考验，适用于生产的库，拥有大量社区资源。 |
| @midwayjs/koa     | Koa 是一个 Express 的替代框架，它默认支持了异步中间件等能力，是第二大通用的 Node.js Web 框架。            |

如果你希望替代默认的 Web 框架，请参考对应的框架章节。

## 启动项目

```bash
$ npm run dev
$ open http://localhost:7001
```

Midway 会启动 HTTP 服务器，打开浏览器，访问 `http://127.0.0.1:7001` ，浏览器会打印出 `Hello midwayjs!`   的信息。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600531997433-eee21874-3f72-4ebf-bcfa-baa6c97ce4bf.png#height=384&id=JfkIS&margin=%5Bobject%20Object%5D&name=image.png&originHeight=768&originWidth=1268&originalType=binary&ratio=1&size=85918&status=done&style=none&width=634" width="634" />

如果需要修改开发的启动端口，可以在 `package.json`  的 scripts 段落里修改，如修改为 6001：

```typescript
"scripts": {
  //...
  "dev": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts --port=6001",
},
```
