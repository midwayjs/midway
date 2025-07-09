# ESModule 使用指南

在过去的几年中，Node.js一直致力于支持运行 ECMAScript模块 (ESM)。这是一个很难支持的功能，因为 Node.js 生态系统的基础是建立在一个不同的模块系统，称为 CommonJS (CJS)。

两个模块系统之间的互操作带来了巨大的挑战，并具有许多功能差异。

自 Node.js v16 之后，ESM 的支持相对已经稳定，TypeScript 的一些配合功能也相继落地。

在此基础上，Midway 支持了 ESM 格式的文件加载，业务也可以使用这种全新的模块加载方式来构建自己的业务。

:::caution

在没有了解 ESM 前，不建议用户使用。

:::

推荐阅读：

* [TypeScript 官方 ESM 指南](https://www.typescriptlang.org/docs/handbook/esm-node.html)
* [Node.js 官方 ESM 文档](https://nodejs.org/api/esm.html)



## 脚手架

由于改动较多，Midway 提供了全新的 ESM 格式的脚手架，如有 ESM 的需求，我们推荐用户重新创建后再来开发业务。

```bash
$ npm init midway@latest -y
```

选择 esm 分组中的脚手架。



## 和 CJS 项目的差异

### 1、package.json 的变化

 `package.json` 中的 type 必须设置为 `module`。

```json
{
  "name": "my-package",
  "type": "module",
  // ...
  "dependencies": {
  }
}
```



### 2、tsconfig.json 中的变化

`compilerOptions` 编译相关的选项需要设置为 `Node16` 或者 `NodeNext`。

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node16",
    "esModuleInterop": true,
    // ...
  }
}
```



### 3、工具链的变化

由于原有开发工具链仅支持 CJS 代码，且社区的部分模块并没有做好 ESM 的支持，Midway 在 ESM 模式下，使用新的工具链。

* 开发命令，使用 mwtsc （仅做了 tsc 必要的包裹）
* 测试和覆盖率命令，使用 mocha + ts-node，同时测试代码和测试的配置都有所调整
* 构建命令，使用 tsc

一些不再支持的功能

* alias path，请用 Node.js 自带的 [子路径导出](https://nodejs.org/api/packages.html#subpath-exports) 代替
* 构建时非 js 文件的拷贝，将非代码文件放到 src 外部，或者在 build 时添加自定义命令

具体差异可以参考 [脚手架](https://github.com/midwayjs/midway-boilerplate/blob/master/v3/midway-framework-koa-esm/boilerplate/_package.json) 进行核对。



### 4、一些代码差异

下面快速列出一些开发中 ESM 和 CJS 的差异。



1、ts 中，import 的文件必须指定后缀名，且后缀名为 js。

```typescript
import { helper } from "./foo.js"; // works in ESM & CJS
```



2、你不能再使用 `module.exports` 或者 `exports.` 来导出。

```typescript
// ./foo.ts
export function helper() {
    // ...
}
// ./bar.ts
import { helper } from "./foo"; // only works in CJS
```



3、你不能在代码中使用 `require`

只能使用 `import` 关键字。



4、你不能在代码中使用 `__dirname`，`__filename` 等和路径相关关键字

```typescript
// ESM solution
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
```

所有配置的部分，必须使用对象模式。

```typescript
import { Configuration } from '@midwayjs/core';
import DefaultConfig from './config/config.default.js';
import UnittestConfig from './config/config.unittest.js';

@Configuration({
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
})
export class MainConfiguration {
  // ...
}
```

