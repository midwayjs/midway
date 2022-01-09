---
title: 项目初始化
---

### 创建

```bash
$ npm init midway
```

在接下来的提示中，选择 Web 应用或者 Serverless 应用

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1623036493849-2583e8e9-90c5-4988-9698-c3538cd65482.png#clientId=ucf92bac9-239e-4&from=paste&height=86&id=u44983b7a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=86&originWidth=807&originalType=binary&ratio=1&size=10190&status=done&style=none&taskId=u7a5d47dc-d709-4c15-9193-7afb3708a98&width=807" width="807" />

### 运行

```bash
$ npm run dev
```

此时可以访问命令行提示的端口，就能看到页面了，你也可以点击 `Send message to backend`，来体验函数式开发的接口。

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622788746000-d557cbdb-76d7-435f-91d8-1a1f54c6af51.png#clientId=u5406b60f-a2f1-4&from=paste&height=222&id=u1aaa3515&margin=%5Bobject%20Object%5D&name=image.png&originHeight=222&originWidth=404&originalType=binary&ratio=1&size=58812&status=done&style=none&taskId=ueeba5812-e5fb-4ffc-907c-9aabe6a78aa&width=404" width="404" />

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622788715959-e1b7d313-9ce3-40c4-bb32-066b665c4d78.png#clientId=u5406b60f-a2f1-4&from=paste&height=845&id=ub431f200&margin=%5Bobject%20Object%5D&name=image.png&originHeight=845&originWidth=1469&originalType=binary&ratio=1&size=338897&status=done&style=none&taskId=u00355cc6-42ea-4999-a6f5-dda5270d326&width=1469" width="1469" />

### 部署

部署前请先运行：

```bash
npm run build
```

> 部署 Web 应用

```bash
$ node bootstrap.js
```

> 部署 Serverless

```bash
$ npm run deploy
```
