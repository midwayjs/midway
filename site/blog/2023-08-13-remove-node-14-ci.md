---
slug: remove-node-14-ci
title: 移除 Node.js v14 的 CI 环境
authors: [harry]
tags: [node]


---

最近一段时间，我们发现越来越多的库移除了 Node.js v14 的支持。

有些库是升级的大版本，有些库仅仅只升级 minor 版本，这使得依赖他们的业务、模块乃至框架都很难信任社区的 SemVer 版本约定了。

为了保持 Midway 的单测正常运行，从 v3.12.0 开始，Midway 移除了 Node.js v14 的 CI，这意味着我们无法测试 Node.js v16 以下社区库的兼容性，只能靠社区库更新的 Changelog 以及我们的经验来保证。

如果我们发现某些库只支持特定版本的 Node.js，我们会在 `package.json` 中进行版本限制，如果你发现某些库的版本更新无法在低版本 Node.js 中运行，且 Midway 的组件没有进行限制，请通知我们。

最后再次提醒，如果没有强需求，请使用 Node.js v16 以上版本。
