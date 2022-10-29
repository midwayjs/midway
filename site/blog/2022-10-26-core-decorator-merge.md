---
slug: core-decorator-merge
title: core 和 decorator 包合并的影响
authors: [harry]
tags: [decorator, core]
---

从 v3.6.0 开始，Midway 在代码层面将 `@midwayjs/decorator` 中的代码迁移到了 `@midwayjs/core` 中，未来 `@midwayjs/decorator` 包将逐步减少使用。

`@midwayjs/decorator` 中的代码全部从 `@midwayjs/core` 中代理出来，代码层面保持向下兼容。

最近发现有些用户会出现类似下面的报错：

![](https://img.alicdn.com/imgextra/i3/O1CN01ZUf1P31oSBRQlBEhv_!!6000000005223-0-tps-3148-554.jpg)

原因为 v2 的版本使用了 v3 的组件，v2 和 v3 的组件不保证能完全兼容，请在安装时做好区分。

解决方案：使用 v2 版本的组件。
