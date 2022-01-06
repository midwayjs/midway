---
title: 开发函数
---

## 初始化代码

让我们来开发第一个纯 HTTP 函数，来尝试将它部署到云环境（不用担心，函数现在都有免费额度，一般情况下不花钱）。

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=faas my_midway_app

# 如果是 npm v7
$ npm init midway -- --type=faas my_midway_app
```

也可以执行 `npm init midway` ，选择 `faas`  脚手架。

## 目录结构

以下就是一个函数的最精简的结构，核心会包括一个 `f.yml` 标准化函数文件，以及 TypeScript 的项目结构。

```bash
.
├── f.yml           	# 标准化 spec 文件
├── package.json    	# 项目依赖
├── src
│   └── function
│       └── hello.ts	## 函数文件
└── tsconfig.json
```

我们来简单了解一下文件内容。

- `f.yml`   函数定义文件
- `tsconfig.json` TypeScript 配置文件
- `src` 函数源码目录
- `src/function/hello.ts` 示例函数文件

我们将函数放在 `function`目录下，是为了更好的和其他类型的代码分开。

## 函数文件

我们首先来看看函数文件，传统的函数是一个 `function` ，为了更符合 midway 体系，以及使用我们的依赖注入，这里将它变成了 Class。

通过 `@ServerlessTrigger`  装饰器，我们将方法标注为一个 HTTP 接口，并且标示 `path`  和 `method`  属性。

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midway') {
    return `hello ${name}`;
  }
}
```

除了触发器外，我们还可以使用 `@ServerlessFunction` 装饰器描述函数层面的元信息，比如函数名，并发度等等。
​

这样，当我们在一个函数上，使用多个触发器时，就可以这样设置。

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloServerlessService {
  @Inject()
  ctx: Context;

  // 一个函数多个触发器
  @ServerlessFunction({
    functionName: 'abcde',
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'every',
    value: '5m',
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'every',
    value: '10m',
  })
  async handleTimerEvent() {
    // TODO
  }
}
```

:::caution
注意，有些平台无法将不同类型的触发器放在同一个函数中，比如阿里云规定，HTTP 触发器和其他触发器不能同时在一个函数生效。
:::

## 函数定义文件

`f.yml` 是函数的定义文件，通过这个文件，在构建时生成不同平台所能认识的文件，示例中的文件内容如下。

```yaml
service:
  name: midway-faas-examples ## 函数组名，可以理解为应用名

provider:
  name: aliyun ## 发布的平台，这里是阿里云

custom:
  customDomain:
    domainName: auto ## 由于发布 HTTP 服务，域名这里使用自动生成，后续可以单独绑定
```

###

## 触发器装饰器参数

`@ServerlessTrigger` 装饰器用于定义不同的触发器，它的参数为每个触发器信息，以及通用触发器参数。
​

触发器和 [f.yml 的定义](/docs/serverless_yml#YoMeC)保持一致，当前的定义请参考每个触发器的 [interface](https://github.com/midwayjs/midway/blob/2.x/packages/decorator/src/interface.ts#L141)。

比如触发器的名称修改为 abc。

```typescript
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    name: 'abc'
    type: 'every',
    value: '5m',
  })
```

## 函数装饰器参数

`@ServerlessFunction` 装饰器用于定义函数，通过它可以修改函数名。
​

函数触发器和 [f.yml 的定义](/docs/serverless_yml#f1568472) 保持一致，当前的定义请参考每个触发器的 [interface](https://github.com/midwayjs/midway/blob/2.x/packages/decorator/src/interface.ts#L141)。
​

比如：

```typescript
@ServerlessFunction({
  functionName: 'abcde',
  initTimeout: 3,		// 初始化超时，只对阿里云 fc 有效，默认 3s
  timeout: 3				// 函数执行超时时间，默认 3s
})
```

## 本地开发

HTTP 函数本地开发和传统 Web 相同，输入以下命令。

```shell
$ npm run dev
$ open http://localhost:7001
```

Midway 会启动 HTTP 服务器，打开浏览器，访问 [http://127.0.0.1:7001](http://127.0.0.1:7001) ，浏览器会打印出 `Hello midwayjs`   的信息。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1615045887650-73a90be7-1d49-4024-82c4-fd6b5192e75e.png#height=384&id=X8Jmz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=768&originWidth=1268&originalType=binary&ratio=1&size=85174&status=done&style=none&width=634" width="634" />

## 部署函数

部署函数，直接使用发布命令即可打包并部署函数：

```shell
$ npm run deploy
```

:::info
如果输错了信息，可以重新执行 `npx midway-bin deploy --resetConfig` 修改。
:::

这里我们用阿里云 FC 平台来演示，如需部署到腾讯云，请参考 [腾讯云部署](deploy_to_tencent)。

阿里云部署首次需要配置 `accountId`、`accountKey`、`accountSecret`

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654967-11e1bcbd-5a56-4239-99e1-5a1472ad49fd.png#height=514&id=cd07s&margin=%5Bobject%20Object%5D&originHeight=514&originWidth=1152&originalType=binary&ratio=1&size=0&status=done&style=none&width=1152" width="1152" />

相关配置获取，可参照下方图片：

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654949-9c14958c-3aff-403a-b89b-d03a3a95cd18.png#height=696&id=XCMN7&margin=%5Bobject%20Object%5D&originHeight=696&originWidth=1832&originalType=binary&ratio=1&size=0&status=done&style=none&width=1832" width="1832" />

点击此处跳转阿里云[安全设置页](https://account.console.aliyun.com/#/secure)。

---

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654950-19a811c5-2cf3-4843-a619-cfd744430fae.png#height=184&id=H5HaQ&margin=%5Bobject%20Object%5D&originHeight=592&originWidth=2406&originalType=binary&ratio=1&size=0&status=done&style=none&width=746" width="746" />

点击跳转阿里云个人 [AccessKey 页面](https://usercenter.console.aliyun.com/#/manage/ak)。

整个部署效果如下：

<img src="https://cdn.nlark.com/yuque/0/2021/svg/501408/1618722302423-d7d159b3-45b0-4a93-a2b1-daf50f46bc9f.svg#clientId=ude874b22-3d94-4&from=ui&id=w8IDi&margin=%5Bobject%20Object%5D&originHeight=1015&originWidth=1620&originalType=binary&ratio=1&size=458083&status=done&style=none&taskId=u53dbfdb6-ec4e-4b4e-866d-ab578d3839a" width="undefined" />

发布完后，从控制台获取当前的 url 即可访问。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618722353090-bf9e0061-ea62-46a2-a77e-57236a4e4024.png#clientId=ude874b22-3d94-4&from=paste&height=361&id=u7afbff35&margin=%5Bobject%20Object%5D&originHeight=722&originWidth=2084&originalType=binary&ratio=1&size=156355&status=done&style=none&taskId=u39af502c-85b3-4eeb-b387-a5d70448c89&width=1042" width="1042" />

由于开启了自动域名，阿里云会免费增送一个临时域名用开发和调试，后续也可以自己绑定新域名。
