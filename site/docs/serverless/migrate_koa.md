---
title: Koa 应用迁移
---

Midway Serverless 提供了一套通用的应用迁移方案，将原有应用尽可能不修改代码，就可以发布到函数平台。使用此方案，可以将原有的 koa 应用尽可能快速简单的迁移到函数平台进行托管，享受云原生时代的弹性红利。

## 新增函数配置

在代码根目录新增加文件 `f.yml` ，内容如下。

```yaml
service: my-koa-demo ## 发布到云平台的应用名

provider:
  name: aliyun ## 发布的云平台，aliyun，tencent 等

deployType: koa ## 部署的应用类型

package:
  exclude:
    - package-lock.json ## 忽略 package-lock.json 文件

custom:
  customDomain:
    domainName: auto ## 自动生成域名
```

:::info
有时候 package-lock.json 文件会造成部署包过大（将 dev 依赖打入）。
:::

## 代码修改

- 1、需要导出默认的 app
- 2、项目文件当前文件名必须为 `app.js`
- 3、 `index.js`  为保留文件，项目中请不要有此文件。

```typescript
// app.js

const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();

// *****

// 注释原本的监听
// app.listen(3000);

// 导出默认的 app
module.exports = app;
```

如果在初始化有异步的情况 ，比如连接数据库等，我们提供了异步的支持。

```typescript
// app.js

const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();

// *****

// 注释原本的监听
// app.listen(3000);

// 导出默认的 app
module.exports = async () => {
  // do some async method, like db connect
  return app;
};
```

## 静态资源

如果在项目根目录有希望构建拷贝的目录，比如静态文件 `public` 目录，请配置 `f.yml` 中的 `package.include` 字段。

```yaml
service: my-egg-demo ## 应用发布到云平台的名字

provider:
  name: aliyun ## 发布的云平台，aliyun，tencent 等

deployType: koa ## 部署的应用类型

package:
  include:
    - public ## 写在这里会被自动打包
  exclude:
    - package-lock.json ## 忽略 package-lock.json 文件
```

## 部署

在 `package.json` 配置 Scripts 脚本和 dev 依赖 `@midwayjs/cli` ，执行 `npm run deploy` 。

```json
{
  "devDependencies": {
    "@midwayjs/cli": "^1.2.36"
    ...
  },
  "scripts": {
    "deploy": "midway-bin deploy",
    ...
  }
}
```

或者使用不同的 npm 包加速。

```bash
{
  "scripts": {
    "deploy": "midway-bin deploy --npm=cnpm",
    ...
  }
}
```

也可以单独执行命令。

```bash
$ npx midway-bin deploy										## deploy by npm
$ npx midway-bin deploy --npm=cnpm				## deploy by cnpm
```

## 默认情况

### 阿里云

**​**

默认发布为  http 触发器，如果需要 API 网关，可以自行按照 f.yml 的格式进行 functions 结构的修改配置，同时，需要在平台配置路由。

### 腾讯云

**​**

默认发布为  API 网关触发器，同时会自动配置网关路由。
​

### 修改部署的函数名

可以通过 name 字段。

```yaml
service: my-demo ## 应用发布到云平台的名字

provider:
  name: aliyun ## 发布的云平台，aliyun，tencent 等

deployType:
  type: koa
  name: app_idx ## 函数名
```

## 一些限制

- 不支持文件上传等网关无法支持的能力
- 还有一些，请参考 [应用迁移 faq](migrate_faq)
