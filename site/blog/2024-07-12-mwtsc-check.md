---
slug: mwtsc-check
title: mwtsc 增加版本检查
authors: [harry]
tags: [mwtsc]



---

由于 Midway 版本发布规则，`@midwayjs/core` 和组件有着版本对应关系，即低版本的 `@midwayjs/core` 无法使用高版本的组件。

比如 `@midwayjs/axios@3.17.0` 可能使用了高版本的 API，是无法在 `@midwayjs/core@3.16.0` 版本上执行的。

由于 npm 等包管理的特性，包安装时不存在联系，`npm i @midwayjs/axios` 时往往只会安装组件最新的版本，非常容易造成兼容性问题。

为此我们提供了 `npx midway-version` 命令，可以快速检查版本之间的兼容性错误。

在推行一阵子之后，我们发现很少有用户主动去执行这样的指令，只会在出错时被动执行，再加上锁包和不锁包的复杂场景，会出现一些很难复现和排查的现象。

为了降低复杂性，在 mwtsc 新版本的启动阶段，我们也加入了检查代码。

![](https://img.alicdn.com/imgextra/i3/O1CN01ZHQcs51tDb5HrSviC_!!6000000005868-2-tps-1550-420.png)

如果出现不兼容的版本，工具会进行提示。

此外，新增的 `npx midway-version -m` 指令可以让固化版本的用户也享受到更新工具。

和之前的 `-u` 指令不同，`-m` 会使用当前的 `@midwayjs/core` 版本，更新组件到最兼容的版本，而不是最新版本。

结合 `mwtsc` 和 `midway-version` 工具，可以更简单的管理版本，如有问题可以反馈给我们改进。



