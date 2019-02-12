---
sidebar: auto
---

# Midway Toolkit

Comming soon.

<!--
## midway-bin

midway-bin 通过继承了 egg-bin，扩展一些跟 ts 相关的命令。

### 安装

默认脚手架已经自带。

```bash
npm install midway-bin --save-dev
```

### 常用命令

包括 egg-bin 自带的:

- midway-bin test 测试命令， ts 使用时需要带上 `--ts`
- midway-bin cov 生成覆盖率命令， ts 使用时需要带上 `--ts`
- midway-bin debug 调试命令， ts 使用时需要带上 `--ts`
- midway-bin autod
- midway-bin dev 本地开发命令， ts 使用时需要带上 `--ts`
- midway-bin pkgfiles

这些命令都没有特别处理，参数和 egg-bin 相同，具体使用可以查看 [egg-bin 文档](https://github.com/eggjs/egg-bin/)

### build 命令

我们增加了一个 build 命令用于增强构建 typescript 项目。

```bash
midway-bin build
```

额外增加了一个 `-c` 参数用于支持打包前清理 `/dist` 目录。

```bash
midway-bin build -c
```

由于 typescript 编译无法拷贝非 `*.ts` 文件，我们特定在对 build 命令做了增强。

在执行 midway-bin build 命令中，会自动调用 `package.json` 的 `midway-bin-build` 段落，配置如下：

```json
{
  "midway-bin-build": {
    "include": [
      "app/public",
      "app/view",
      "lib/platform/aone/api.json",
      "lib/*.json",
      "lib/*.text",
      ["pattern/**", "!pattern/**/*.js"]
    ]
  }
}
```

::: tip
这里的路径相对于 src 目录。
:::

你可以在其中使用相对路径或者通配符，乃至任意符合 [glob 语法](https://github.com/isaacs/minimatch#usage) 的 pattern 数组。

这样在打包时会自动将相应的目录或者文件从 `src` 目录拷贝到对应的 `dist` 目录中。


### clean 命令

我们增加了一个 clean 命令用于清理一些临时文件。

```bash
midway-bin clean
```

清理的内容包括：

- logs 目录
- run 目录
- .nodejs-cache 目录

同时和 build 命令类似，你可以在 `package.json` 的 `midway-bin-clean` 段落增加配置，用于清理自己的目录和文件。

```json
{
  "midway-bin-clean": [
    "src/app/public",
    "resource/temp"
  ]
}
```

::: tip
这里的路径相对于应用的根目录。
:::


## midway-init

提供了基础的 midway 应用脚手架，后续会增加其他模板。

```bash
npm install -g midway-init
midway-init
``` -->
