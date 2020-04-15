![](https://img.alicdn.com/tfs/TB1y4zbsEY1gK0jSZFMXXaWcVXa-10530-6280.png)

<p align="center">
  <a href="https://www.npmjs.com/package/@midwayjs/faas" alt="npm version">
    <img src="https://img.shields.io/npm/v/@midwayjs/faas.svg?style=flat" /></a>
  <a href="./LICENSE" alt="GitHub license">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://github.com/midwayjs/midway-faas/actions?query=workflow%3A%22Node.js+CI%22" alt="Node.js CI">
    <img src="https://img.shields.io/badge/Node.js%20CI-passing-brightgreen" /></a>
  <a href="https://github.com/midwayjs/midway-faas" alt="Activity">
    <img src="https://img.shields.io/github/commit-activity/m/midwayjs/midway-faas" /></a>
  <a href="https://github.com/midwayjs/midway-faas/graphs/contributors" alt="Contributors">
    <img src="https://img.shields.io/github/contributors/midwayjs/midway-faas" /></a>
</p>

Midway FaaS 是用于构建云函数的 Serverless 框架。帮助您在云原生时代大幅降低维护成本，更专注于产品研发。

- **跨云厂商** ：一份代码可在多个云平台间快速部署，不用担心你的产品会被云厂商所绑定。
- **代码复用** ：通过框架的依赖注入能力，让每一部分逻辑单元都天然可复用，可以快速方便地组合以生成复杂的应用。
- **传统迁移** ：通过框架的运行时扩展能力，让 Egg.js 、Koa、Express.js 等传统应用无缝迁移至各云厂商的云函数。


查看 [详细文档](https://www.yuque.com/midwayjs/faas)

## 快速开始

> 国内用户建议使用 cnpm 加速 npm<br />
> 比如 npm install -g cnpm --registry=https://registry.npm.taobao.org<br />
> 然后将之后所有的 npm 命令替换为 cnpm


<br />首先，你需要安装 Node（> 10.9)，以及 npm。<br />

```shell
$ npm install @midwayjs/faas-cli -g
```

<br />安装完成之后，在全局就拥有了 `f` 命令，你可以使用 `f -h` 查看拥有的能力。<br />


> `@midwayjs/faas-cli` 是当前最新的函数开发命令行工具，包含了本地调用，调试，mock 发布等一系列能力。



## 创建一个标准函数

<br />执行下面的命令。<br />

```shell
$ f create
```

<br />你会看到以下脚手架选择，选择 `faas-stardard` 。<br />

```shell
Generating boilerplate...
? Hello, traveller.
  Which template do you like? …
❯ faas-standard - A serverless boilerplate for aliyun fc, tecent scf and so on
  faas-layer - A serverless runtime layer boilerplate
```

<br />如图所示。<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1586174778951-76ccbb2b-d1f7-4505-a3b6-6961df34c9e6.png#align=left&display=inline&height=326&margin=%5Bobject%20Object%5D&name=image.png&originHeight=652&originWidth=1580&size=94474&status=done&style=none&width=790)<br />
<br />安装依赖。<br />

```shell
$ npm install
```


## 目录结构

<br />以下就是一个函数的最精简的结构，核心会包括一个 `f.yml` 标准化函数文件，以及 TypeScript 的项目结构。<br />

```shell
.
├── f.yml           # 标准化 spec 文件
├── package.json    # 项目依赖
├── src
│   └── index.ts    # 函数入口
└── tsconfig.json
```

<br />
<br />我们来简单了解一下文件内容。<br />

- `f.yml`  函数定义文件
- `tsconfig.json` tsc 配置文件（没有 IDE 会报错）
- `src` 函数源码目录
- `src/index.ts` 示例函数文件



### 函数文件

<br />我们首先来看看函数文件，传统的函数是一个 `function` ，为了更符合 midway 体系，以及使用我们的依赖注入，这里将它变成了 class。<br />

```typescript
import { Func, Inject, Provide } from '@midwayjs/decorator';
import { FaaSContext, FunctionHandler } from '@midwayjs/faas';

@Provide()                      // 提供 IoC 容器扫描标识
@Func('index.handler')          // 标注函数
export class IndexService implements FunctionHandler {

  @Inject()
  ctx: FaaSContext;              // 函数执行上下文

  async handler() {              // 函数体
    return 'hello world';        // 函数返回值
  }
}

```


### 函数定义文件

<br />`f.yml` 是函数的定义文件，midway faas 通过这个文件，在构建时生成不同平台所能认识的文件，示例中的文件内容如下。<br />

```yaml
service:
  name: serverless-hello-world        ## 函数组名，可以理解为应用名

provider:
  name: aliyun                        ## 发布的平台，这里是阿里云
  
functions:                            ## 函数的定义
  index:                              ## 第一个函数名，名叫 index
    handler: index.handler            ## 函数的入口为 index.handler
    events:                           ## 绑定的触发器，这里为 http 触发器，用到的方法为 get
      - http:
          method: get
package:                              ## 构建出来的压缩包文件名
  artifact: code.zip

```


## 开发函数
### 本地调用

<br />脚手架代码创建完毕后，我们可以尝试调用一下。<br />
<br />输入以下命令。<br />

```shell
$ f invoke -f index
```


:::info
invoke 命令是用于本地简单的调用一下函数， `-f` 参数用于指定一个函数名，第一次调用时，会让用户选择需要发布到哪个平台。
:::

<br />由于我们的示例为 http 触发器，所以输出结果如下，我们的 `hello world` 会被包裹在一个大 JSON 中。<br />

```
--------- result start --------

{"headers":{"Content-Type":["application/json; charset=utf-8"],"content-type":"text/plain"},"statusCode":200,"body":"hello world","base64Encoded":false}

--------- result end --------
```


## 部署函数

<br />部署函数分为两步，一是打包（package）而是部署发布（deploy），直接使用发布命令即可打包并部署函数：
```shell
$ f deploy
```
支持所有 `package` 命令的参数<br />

| 参数 | 释义 |
| --- | --- |
| --resetConfig | 使用新的账户 |



### 部署到阿里云云函数（FC）

<br />阿里云部署首次需要配置 `accountId`、`accountKey`、`accountSecret`<br />![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654967-11e1bcbd-5a56-4239-99e1-5a1472ad49fd.png#align=left&display=inline&height=514&margin=%5Bobject%20Object%5D&originHeight=514&originWidth=1152&size=0&status=done&style=none&width=1152)<br />
<br />相关配置获取，可参照下方图片：<br />![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654949-9c14958c-3aff-403a-b89b-d03a3a95cd18.png#align=left&display=inline&height=696&margin=%5Bobject%20Object%5D&originHeight=696&originWidth=1832&size=0&status=done&style=none&width=1832)<br />点击此处跳转阿里云[安全设置页](https://account.console.aliyun.com/#/secure)。<br />![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654950-19a811c5-2cf3-4843-a619-cfd744430fae.png#align=left&display=inline&height=184&margin=%5Bobject%20Object%5D&originHeight=592&originWidth=2406&size=0&status=done&style=none&width=746)<br />点击跳转阿里云个人 [AccessKey 页面](https://usercenter.console.aliyun.com/#/manage/ak)。<br />

### 部署到腾讯云云函数（SCF）


1. 用户信息认证：
  - 腾讯云在部署时，如果是首次部署，则控制台会展示相应二维码，扫码即可完成认证，后续会默认复用该配置
  - 后续如想修改部署时的使用的用户，可手动在 serverless.yml 中设置当前用户的认证信息，教程：[https://cloud.tencent.com/document/product/1154/38811](https://cloud.tencent.com/document/product/1154/38811)
2. 部署网关设置
  - 腾讯云在部署时，会为函数默认创建网关触发器
  - 如果想避免重复创建，可按下列教程操作


<br />发布完成后，控制台会默认显示腾讯云此次创建的网关 serviceId（如下图所示）<br />![](https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654982-dd6daae9-9318-419b-9c04-83c28e0e3326.png#align=left&display=inline&height=410&margin=%5Bobject%20Object%5D&originHeight=410&originWidth=2670&size=0&status=done&style=none&width=2670)<br />
<br />此时需要修改 serverless.yml 的配置文件，serviceId 可以配在以下两处：<br />

1. provider


<br />此处配置则对**所有函数生效**，所有函数共享一个网关 serviceId<br />

```yaml
provider:
  name: tencent
  runtime: Nodejs8.9
  serviceId: <控制台返回的 ServiceId>
```


2. events/http


<br />此处配置则对**指定函数生效**<br />

```yaml
functions:
  index:
    initializer: index.initializer
    handler: index.handler
    events:
      - http:
          method: get
          serviceId: <控制台返回的 ServiceId>
```

## License

[MIT](./LICENSE)
