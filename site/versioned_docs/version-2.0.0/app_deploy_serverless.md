---
title: 应用迁移方案说明
---

## 迁移方案

本方案适用于已有 EggJS，Express，Koa 等应用，可以部署在不同云平台的弹性容器中，减少部署和运维成本。

请根据当前的应用类型进行文档选择。

[Egg/Midway 应用迁移](https://www.yuque.com/go/doc/32353538?view=doc_embed)[Express 应用迁移](https://www.yuque.com/go/doc/32353537?view=doc_embed)[Koa 应用迁移](https://www.yuque.com/go/doc/32353536?view=doc_embed)

## 这套方案和平台的迁移方案有什么区别？

Midway Serverless 从 v1.1 版本开始提供了一套应用迁移到  Serverless 容器的方案，而各个平台也已经有自己的方案，比如阿里云的 customRuntime 接入方案，以及腾讯云的各种 Component 组件。

这其中的区别有几个：

- 1、Midway Serverless 提供的平台迁移方案和函数部分相同，**是跨平台的**，即方案不受限于阿里云或者其他云平台，代码和应用时期一致，不需要（或者很少）做修改
- 2、复用函数的运行时适配能力，可以和函数享受同样稳定的能力，这套适配能力由 Midway Serverless 本身提供，**代码开源，也方便排查和定位问题**，或者增强能力
- 3、Midway Serverless 这套能力比较通用，私有化部署或者**适配其他应用框架非常容易**

**​**

## 迁移方案和纯函数的区别

迁移方案使用的是传统的应用代码，在部署时使用的是固定的 HTTP 触发器模式，无法在项目中添加其他触发器。
​

迁移方案通过一套中间的代理层（Proxy Layer），将函数的入参转换为传统请求到原函数，而纯函数不经过这层代理，所以性能会比迁移方案高。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1623937490756-27bcb3d0-8d61-49af-a1f1-0efe72b5c1dc.png#clientId=ub2750586-4d72-4&from=paste&height=542&id=u06931f71&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1084&originWidth=2290&originalType=binary&ratio=2&size=120683&status=done&style=none&taskId=u4f359237-b2d5-46ad-9dfa-42fd42375fa&width=1145" width="1145" />

​

如需纯函数，可以新起一个纯函数项目。
​

迁移方案绑定的是 `/*` 的路由，和纯函数可以共享一个域名。

## 一些能力限制

- 1、平台网关的限制，比如阿里云和腾讯云网关，超时时间，POST 大小、文件上传等，和函数是一样的，即函数不能做的事情，在这套应用部署方案中依旧不能做
- 2、应用的包部署不宜过大，如果比较大，可以使用云平台的对应方案来解决，比如阿里云的 NAS，或是腾讯云/AWS 的 Layer
- 3、应用在函数容器中的带状态的部分，由应用本身处理，这套方案不负责解决这个问题
- 4、应用在函数容器中部署模型为**单进程，**稳定性由弹性容器本身来解决
- 5、应用中有 long runing 或者定时任务的部分，在无流量情况下不会触发，请使用其他方案代替。
- 6、应用中 socket 等非 HTTP 协议，不会生效
