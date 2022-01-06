---
title: 常见框架错误
---

## 多个 @midwayjs/decorator 警告

`@midwayjs/decorator` 包一般来说，npm 会让相同的依赖在 node_modules 存在一份实例，其余的模块都会通过软链（link）链接到 node_modules/@midwayjs/decorator。

我们会用到下面的命令，`npm ls` 会列出项目底下某个包的依赖树。

```bash
$ npm ls @midwayjs/decorator
```

比如下图所示。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1619410071552-37bf3b21-202c-4925-9140-5244d526225c.png#clientId=u71824833-3cf4-4&from=paste&height=183&id=u9799682e&margin=%5Bobject%20Object%5D&name=image.png&originHeight=183&originWidth=541&originalType=binary&size=29975&status=done&style=none&taskId=uc4dadc41-2faf-4bd0-a11b-703a7aa1734&width=541" width="541" />

灰色的 `deduped` 指的就是该包是被 npm 软链到同一个模块，是正常的。

我们再来看下有问题的示例。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1619410270669-45dd7973-ddc8-4ad5-b9b6-e7a2822b6686.png#clientId=u71824833-3cf4-4&from=paste&height=308&id=u0fc19ab4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=308&originWidth=1010&originalType=binary&size=140832&status=done&style=none&taskId=u29f7d583-7971-4ffe-87cf-0413e02dfba&width=1010" width="1010" />

这是一个 lerna 项目，最下面的 demo-docs 中的 decorator 包，后面没有 **deduped** 标示，说明这个包是独立存在的，是错误的。

根据这个思路，我们可以逐步排查为什么会出现这种情况。

比如上图，可能是在单个模块中使用的 npm install，而不是使用 lerna 安装。

我们可以按照下面的思路逐步排查：

- 1、包含不同版本的 decorator 包（比如，package-lock 锁包，或者依赖写死版本）
- 2、未正确使用 lerna 的 hoist 模式（比如上图，可能是在单个模块中使用的 npm install，而不是使用 lerna 安装）

​

## xxx is not valid in current context

这个是当依赖注入容器中某个属性所关联的类在依赖注入容器中找不到爆出的。这个错误展示的可能会递归，比较深。

比如：

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1621827595535-04bba2da-e00d-4743-8476-12b96733afca.png#clientId=u9d5ed330-0baa-4&from=paste&height=141&id=u759ee365&margin=%5Bobject%20Object%5D&name=image.png&originHeight=141&originWidth=1053&originalType=binary&size=191056&status=done&style=none&taskId=ud19d0270-80f8-45a7-82e2-0e2a9da8e07&width=1053" width="1053" />

错误核心就是第一个属性，在某个类中找不到。
​

比如上图的核心就是 `packageBuildInfoHsfService` 这个注入的类找不到。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1621827663159-75dd34ca-5dcd-4301-be23-f6bd59ee9f2e.png#clientId=u9d5ed330-0baa-4&from=paste&height=166&id=ucf60cd20&margin=%5Bobject%20Object%5D&name=image.png&originHeight=166&originWidth=765&originalType=binary&size=149169&status=done&style=none&taskId=ub1438e1c-aceb-4a3a-b528-6858619363d&width=765" width="765" />

这个时候，就需要去对应的类中去看，是否是 provide 出来的名字被自定义了。
​

常见的问题有：
​

- 1、Provide 装饰器导出的名字不对，无法和属性对应
- 2、Provide 为空的话，大概率是大小写没写对
- 3、注入是组件的话，可能是漏了组件名

​

简单的解法：`@Inject` 装饰器不加参数，属性的定义写明确的类，这样 midway 可以自动找到对应的类并注入（不适用于多态的情况）。

```typescript
@Inject()
service: PackageBuildInfoHsfService;
```
