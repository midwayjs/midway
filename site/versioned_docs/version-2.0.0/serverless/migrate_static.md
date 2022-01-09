---
title: 静态网站托管
---

此方案适用于纯前端项目（React、vue 等）托管到 Serverless 平台（阿里云，腾讯云等）。

常见的场景有托管公司官网，个人主页，博客等。

## 使用方法

在任意的静态项目下加入下面的 `f.yml` ，内容如下：

```yaml
service: my-static-demo  			## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType: static

package:
  include:
  	- build										## 需要拷贝的目录
  exclude:
    - package-lock.json				## 忽略 package-lock.json 文件

custom:
  customDomain:
    domainName: auto					## 自动生成域名
```

:::info
有时候 package-lock.json 文件会造成部署包过大（将 dev 依赖打入）。
:::

加入 dev 依赖 `@midwayjs/cli` 。

```json
{
  "devDependencies": {
    "@midwayjs/cli": "^1.2.36"
  	...
  },
  "scripts": {
    "deploy": "npm run build && midway-bin deploy --skipBuild"
  }
}
```

执行 `npm run deploy`  即可。

或者使用不同的 npm 包加速。

```bash
{
  "scripts": {
    "deploy": "npm run build && midway-bin deploy --skipBuild --npm=cnpm",
    ...
  }
}
```

:::info
这里使用 --skipBuild 参数是为了跳过函数的构建。 `npm run build`  对接前端的构建命令。
:::

默认情况下，会使用 `build`  目录作为托管根目录，访问 `/`  路由时，会自动查找 `/index.html` 。

比如：

- / => /index.html
- /api/ => /api/index.html

## 可选配置

除了默认配置外，我们可以对静态网站做一些额外的配置。

### 修改托管目录

```yaml
service: my-static-demo  			## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType:
	type: static
  config:
  	rootDir: public						## 托管目录变为 public

package:
  include: public							## 需要拷贝的目录，随着配置的托管目录为变
```

### 修改托管前缀

有时候部署需要统一的路由前缀，比如 `/api/*`  这样的形式。

```yaml
service: my-static-demo  			## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType:
	type: static
  config:
  	prefix: /api

package:
  include: build
```

这样所有的 /_ 都会变成 /api/_。

### 配置 404 页面

普通的路由是根据托管的目录结构和文件来的。如果访问到不存在的文件，则会返回 404。我们可以指定一个 404 页面。

```yaml
service: my-static-demo  			## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType:
	type: static
  config:
  	notFoundUrl: /404.html

package:
  include: build
```

### rewrite 路由

​

有时候，我们希望将一些特定的路由，都访问到特定的文件上，比如将所有的路由请求，都转向到 `/index.html` ，然后让前端路由处理。

```yaml
service: my-static-demo  			## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType:
	type: static
  config:
  	rewrite:
    	/(.*): /index.html

package:
  include: build
```

此 rewrite 可以写多个，规则同 [koa-rewrite](https://github.com/koajs/rewrite)。
​

如果要排除某些目录，可以使用 `@not` 取反语法。
​

比如，排除 static 目录。

```yaml
deployType:
  type: static
  config:
    rootDir: build
    rewrite:
      '@not /static/(.*)': /index.html
```

​

​

​

### 修改部署的函数名

可以通过 name 字段。
​

```yaml
service: my-static-demo  			## 应用发布到云平台的名字

provider:
  name: aliyun       					## 发布的云平台，aliyun，tencent 等

deployType:
	type: static
  name: app_idx								## 函数名

package:
  include: public							## 需要拷贝的目录，随着配置的托管目录为变
```
