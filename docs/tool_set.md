---
sidebar: auto
---

# midway 工具集

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

### doc 命令

midway-bin doc 命令用于通过 typedoc 生成文档，比如 midway 的 api 就是通过此命令生成的。

```bash
midway-bin doc
```

使用的[命令参数](https://typedoc.org/guides/arguments/)和 typedoc 一致。

直接可使用的参数包括以下这些，有些已经指定了默认值。

- `--options [typedoc.js]` Specify a js option file that should be loaded.
- `--out -o [outPath]` Specifies the location the documentation should be written to.
- `--mode -m` default value is `file`, Specifies the output mode the project is used to be compiled with.
- `--exclude` Exclude files by the given pattern when a path is provided as source.
- `--theme` default value is `default` Specify the path to the theme that should be used.
- `--excludeExternals` default value is `true` Prevent externally resolved TypeScript files from being documented.
- `--ignoreCompilerErrors` default value is `true` Generates documentation, even if the project does not TypeScript compile.
- `--hideGenerator` default value is `true` Do not print the TypeDoc link at the end of the page.

::: tip
如果指定了 `--options` 参数，那么其他的参数都会失效，请都在 `--options` 参数指定的文件中进行处理。
:::

## midway-init

提供了基础的 midway 应用脚手架，后续会不断增加其他模板。

```bash
npm install -g midway-init
midway-init
```

可以通过内建的命令创建脚手架

```bash
midway-init -h                                          // 帮助文档
midway-init --dir my_project                            // 在当前目录下的 my_project 子目录创建脚手架
midway-init --type midway-ts                            // 从内置脚手架类型 midway-ts 创建目录
midway-init --template ../custom_boilerplate            // 从本地的特地目录创建脚手架
midway-init --package midway-boilerplate-typescript     // 从 npm 包创建脚手架
midway-init --registry china/npm/registry.cnpmjs.org    // 从不同的 registry 获取 npm 包，和 --package 合用
```

## tslint-midway-contrib

midway 对 Typescript 应用提供了简单的 tslint 规则包，只需要在 tslint.json 中做简单的继承，如果有其他的需求

```json
// package.json
  "devDependencies": {
    "tslint-midway-contrib": "1",
  }
```

```json
// tslint.json
{
  "extends": [
    "tslint-midway-contrib"
  ]
}
```
