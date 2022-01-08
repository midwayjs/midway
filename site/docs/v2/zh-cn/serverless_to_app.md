---
title: Serverless 函数部署为应用
---

Midway Serverless 在 v1.0 版本已经支持部署到各个 Serverless 云平台，例如阿里云 FC、腾讯云 SCF 等。从 v2.0 版本开始支持已有的 Serverless 函数以应用模式部署在你的私有服务器上。

## 前提

`@midwayjs/faas`  版本需要大于 `2.8.7` 。

## 使用

####

### 1、安装应用部署依赖

主要是 `@midwayjs/bootstrap`  和 `@midwayjs/serverless-app`  包。

```bash
$ npm i @midwayjs/bootstrap @midwayjs/serverless-app --save
```

`@midwayjs/bootstrap`  用于启动 Midway 上层框架， `@midwayjs/serverless-app`  用于将原有的函数代码包裹成实际应用运行，它也是 Midway 的上层 Framework 之一。

### 2、添加启动文件

在项目根目录添加 `bootstrap.js`  文件，代码如下：

```javascript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
const { Framework } = require('@midwayjs/serverless-app');
const app = new Framework().configure({
  port: 7001,
});

Bootstrap.load(app).run();
```

### 3、部署应用

可以在 `package.json`  中增加 `start`  命令方便启动。

```json
{
  "scripts": {
    "start": "NODE_ENV=production node bootstrap.js"
  }
}
```

然后执行 `npm run start`  即可。也

可以直接使用 `pm2`  等工具执行该命令进行启动。

启动后访问 `http://127.0.0.1:7001` 。
