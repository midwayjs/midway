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

原因有两类：

**1、v3 的版本的 core 和组件版本不一致**

在开发时，直接使用 `npm install` 而安装了 latest 版本（>=v3.6.0） 的组件。

由于 core 的版本依旧在 `3.6.0` 以下，但是组件依赖了最新版本 core 的 API，从而报错。

我们在文档 [如何更新 Midway](../docs/how_to_update_midway) 中有描述，请不要单独升级某个组件包。

解决方案有两个：

- 1、可以使用低版本的组件，比如 `3.6.0` 以下
- 2、或者升级 core 和其他的版本统一到  `3.6.0` 以上



**2、v2 的版本使用了 v3 的组件**

在 v2 版本时，直接使用 `npm install` 而错误安装了 latest 版本（v3） 的组件。

我们为了适配最新的版本正好升级了 v3 的组件，从而暴露了引了错误的版本的这个问题。

现在 v2 和 v3 的组件不保证能完全兼容，所以请在安装时做好区分。

解决方案：使用 v2 版本的组件。

