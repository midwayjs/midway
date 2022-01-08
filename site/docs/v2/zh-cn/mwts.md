---
title: Lint 工具、规则和格式化
---

Midway 的框架和业务代码都是由 TypeScript 编写的，默认 Midway 提供了一套默认的 lint、编辑器以及格式化规则，用于更方便的进行开发和测试。

## 代码风格库

Midway 的代码风格库叫 [mwts](https://github.com/midwayjs/mwts)，源自于 Google 的 [gts](https://github.com/google/gts)。mwts 是 Midway 的 TypeScript 样式指南，也是格式化程序，linter 和自动代码修复程序的配置。

:::info
在 midway 项目中，我们会默认添加 mwts，下面的流程只是为了说明如何使用 mwts。
:::

为了使用 mwts，我们需要把它添加到开发依赖中。

```json
  "devDependencies": {
    "mwts": "^1.0.5",
    "typescript": "^4.0.0"
  },
```

## ESLint 配置

mwts 提供了一套默认的 ESLint 配置（TSLint 已经废弃，合并到了 ESLint 中）。

在项目根目录创建 `.eslintrc.json`  文件，内容如下（一般脚手架会自带）：

```json
{
  "extends": "./node_modules/mwts/",
  "ignorePatterns": ["node_modules", "dist", "test", "jest.config.js", "interface.ts"],
  "env": {
    "jest": true
  }
}
```

上面是 midway 项目的默认配置，其他项目 `ignorePatterns`  和 `env`  可以自行根据 ESLint 自行调整。

整个 mwts 的默认规则请参考 [这里](https://github.com/midwayjs/mwts/blob/master/.eslintrc.json)，如有需求，可以自行调整。

## 执行代码检查和格式化

可以通过执行 `mwts check`  命令和 `mwts fix`  命令，来检查代码。比如在项目中增加脚本命令（一般脚手架会自带）。

```typescript
  "scripts": {
    "lint": "mwts check",
    "lint:fix": "mwts fix",
  },
```

## Prettier 配置

mwts 提供了一套默认的 prettier 配置，创建一个 `.prettierrc.js`   文件，配置内容如下即可（一般脚手架自带）。

```javascript
module.exports = {
  ...require('mwts/.prettierrc.json'),
};
```

## 配置保存自动格式化

我们以 VSCode 为例。

第一步，安装 Prettier 插件。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618042429530-177c3636-aefc-419d-8d3a-5258cad13631.png#align=left&display=inline&height=536&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1072&originWidth=800&size=114476&status=done&style=none&width=400" width="400" />

打开配置，搜索 “save”，找到右侧的 "Format On Save"，勾选即可。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618042494782-71b6cc3c-18ae-4344-987b-ec82084f2dd8.png#align=left&display=inline&height=788&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1576&originWidth=2370&size=341414&status=done&style=none&width=1185" width="1185" />

如果保存文件没有效果，一般是编辑器有多个格式化方式，可以右键进行默认选择。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618125271116-845e8452-0f7b-46a9-a28a-388f2db9c5e3.png#align=left&display=inline&height=458&margin=%5Bobject%20Object%5D&name=image.png&originHeight=916&originWidth=564&size=102932&status=done&style=none&width=282" width="282" />
 
选择 “配置默认格式化程序”。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618125381302-d3fe30c1-e56d-43f8-ada2-6e315f4ff2c4.png#align=left&display=inline&height=144&margin=%5Bobject%20Object%5D&name=image.png&originHeight=288&originWidth=990&size=37986&status=done&style=none&width=495" width="495" />

选择 Prettier 即可。

<img src="https://cdn.nlark.com/yuque/0/2021/png/501408/1618125423564-8e46b0f8-f422-4e3d-a805-3b0a1db037f8.png#align=left&display=inline&height=104&margin=%5Bobject%20Object%5D&name=image.png&originHeight=208&originWidth=1074&size=35043&status=done&style=none&width=537" width="537" />
