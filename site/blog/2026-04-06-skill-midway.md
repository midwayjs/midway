---
slug: skill/midway
title: 新增 @midwayjs/skill-midway
authors: [harry]
tags: [midway, ai, skill]
---

我们新增了 `@midwayjs/skill-midway`。

这个包提供两类能力：

- 把 Midway Skill 安装到项目里的 AI 工具目录
- 在本地查询 Midway 的文档、API、包信息和 changelog

<!-- truncate -->

## 怎么安装

先在项目里安装依赖：

```bash
$ npm i @midwayjs/skill-midway@4 --save-dev
```

或者：

```bash
$ pnpm add -D @midwayjs/skill-midway@4
```

安装完成后，执行：

```bash
$ npx midway-skill install
```

命令会进入交互式选择。

如果你希望直接指定目标，也可以这样执行：

```bash
$ npx midway-skill install --target codex
$ npx midway-skill install --target cursor
$ npx midway-skill install --target trae
```

默认是项目级安装，会把 Skill 写到当前项目目录，而不是全局目录。

目前已经支持多种 AI 工具，包括 Codex、Cursor、Trae、Claude、Windsurf、GitHub Copilot 等。

相关文档可以查看：

- [Midway Skill 使用](https://midwayjs.org/docs/skill_midway)
