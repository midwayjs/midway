---
title: Egg/Midway 应用迁移
---

Midway Serverless 提供了一套通用的应用迁移方案，将原有应用尽可能不修改代码，就可以发布到函数平台。使用此方案，可以将原有的 egg/midway 应用尽可能快速简单的迁移到函数平台进行托管，享受云原生时代的弹性红利。

## 使用

在代码根目录新增加文件 `f.yml` ，最为精简的内容如下。

```yaml
service: my-egg-demo ## 应用发布到云平台的名字

provider:
  name: aliyun ## 发布的云平台，aliyun，tencent 等

deployType: egg ## 部署的应用类型

package:
  include:
    - public ## 如果有静态文件目录，写在这里会被自动拷贝
  exclude:
    - package-lock.json ## 忽略 package-lock.json 文件

custom:
  customDomain:
    domainName: auto ## 自动生成域名
```

:::info
有时候 package-lock.json 文件会造成部署包过大（将 dev 依赖打入）。
:::

## TS 编译

如果是 midway 项目，可以使用我们提供的发布钩子，在发布时自动执行编译，在 `package.json` 配置如下。

```json
{
  "name": "xxxxxx",
  "version": "xxxx",
  .....
  "scripts": {
		"deploy": "midway-bin deploy",
  	....
	},
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run build"
    }
  },
	"egg": {
  	"framework": "@midwayjs/web"
  }
}
```

这里的要点有两个：

- 1、这里指定了 `egg` 字段，用于指定特定的 egg 上层框架
- 2、这里配置了 `midway-integration` 字段，用于支持 midway 应用体系下原来的编译。
- 3、增加 deploy 脚本

:::info
如果使用了自己的 egg 上层框架，这里的 egg.framework 可以变为自己的包名。
:::

如果使用了 egg-ts ，则配置如下。

```json
{
  "name": "xxxxxx",
  "version": "xxxx",
  .....
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run tsc"
    }
  }
}
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

### 修改默认部署的函数名

可以通过 name 字段。

```yaml
service: my-demo  						## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType:
	type: egg
  name: app_idx								## 函数名
```

:::info
使用 deployType 时 aggregation 字段不生效。
:::

### 迁移方案的 Egg 默认配置

当前迁移方案会增加一些默认配置，用于在函数体系下更好运行，**一般情况下，用户无需修改**。

```typescript
// config.default
const os = require('os');
exports.logger = {
  dir: os.tmpdir(),
};

exports.rundir = os.tmpdir();

exports.static = {
  buffer: true,
};
```

由于函数环境磁盘不可写，我们将默认的日志目录都调整为了临时目录。

```typescript
// plugin

'use strict';

exports.i18n = false;
exports.watcher = false;
exports.development = false;
exports.logrotator = false;
exports.schedule = false;
exports.static = false;
```

和默认 egg 不同的是，这里默认关闭了 static 插件，原因是，如果默认没有 `app/public`  目录，插件启动时会创建一个，由于服务器磁盘不可写，就会报错。

如果有 static 插件的需求，请**手动打开**，并**务必保证存在** `app/public`  或者相应的目录。

如果 `public`  目录在根目录，请配置 `f.yml`  中的 `package.include`  字段。

```yaml
service: my-egg-demo ## 应用发布到云平台的名字

provider:
  name: aliyun ## 发布的云平台，aliyun，tencent 等

deployType: egg ## 部署的应用类型

package:
  include:
    - public ## 如果有静态文件目录，写在这里会被自动拷贝
  exclude:
    - package-lock.json ## 忽略 package-lock.json 文件
```

### 阿里云

默认发布为 http 触发器，如果需要 API 网关，可以自行按照 f.yml 的格式进行 functions 结构的修改配置，同时，在 API 网关处配置路由 `/*`  中转到该函数即可。

### 腾讯云

默认发布为 API 网关触发器，同时会自动配置网关路由。

## 一些限制

- 不支持 egg-socketio 等
- 不支持文件上传等网关无法支持的能力
- 还有一些，请参考 [应用迁移 faq](migrate_faq)
