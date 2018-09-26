---
sidebar: auto
---

# TS 新手指南

Typescript 和 Javascript 既相似又有着许多不同，以往的 Node.js 应用和模块大多都是 Javascript 写的。

而 Midway 在阿里沉淀多年，在多人协作和开发的过程中我们发现，Typescript 的接口定义和类型系统，使得应用编码出错的概率大大降低。

在全新的体系中，我们 **推荐使用 Typescript 语法来编码**。

## 应用目录结构

虽然 Typescript 的目录多种多样，但是在统一的编码规范中，我们推荐常用的一种，这里就简单介绍我们常见的目录以及文件。

```
├── app
   ├── README.md
   ├── .gitignore
   ├── package.json
   ├── src
   ├── dist
   ├── test
   ├── tsconfig.json
   └── tslint.json
```

最常见的目录结构如下，我们一一来介绍。


### ts 依赖

在介绍目录之前，我们先介绍应用需要安装的依赖，这些依赖已经作为默认内容在脚手架中提供。

```json
// in package.json
"devDependencies": {
  "@types/mocha": "^5.2.5",
  "@types/node": "^10.5.5",
  "ts-node": "^7.0.1",
  "tslint": "^5.9.1",
  "typescript": "^2.8.0"
}
```

这里的依赖有两部分，`@types/*` 开头的定义文件和其他 ts 运行时需要的文件。

- @types/node - Node.js 的定义包，有了它原生内置的模块就有了类型定义，@types/mocha 同理
- typescript - 微软提供的 ts 核心包，提供了高阶的语法糖支持，同时也提供了 tsc 等编译器。
- ts-node - 三方提供的运行环境，由于 js 运行无需编译，只需要 `node index.js` 即可运行，同理，可以用 `ts-node index.ts` 来直接运行 ts，方便开发


### src 和 dist

由于 Typescript 是编译过程中进行类型检查，虽然在开发过程中可以通过类似 [ts-node](https://github.com/TypeStrong/ts-node) 这样的模块来简化，但是最终应用部署前，还是需要打包编译的，midway 提供了 `midway-bin build` 命令进行编译，这一内容将在工具部分来提供。

`src` 目录存放 Typescript 源文件，Typescript 源文件由 `*.ts` 结尾，而编译后的文件为 `*.js`，在一般情况下，和源文件一一对应。

### tsconfig.json 文件

这是 Typescript 的核心配置文件，一般在应用根目录，里面的配置项一般是都是指定编译环境。

比如：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "stripInternal": true,
    "pretty": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "dist",
    "lib": ["es2017", "dom"]
  },
  "exclude": [
    "dist",
    "node_modules",
    "test"
  ]
}

```

`experimentalDecorators` 就是用来表示是否启用装饰器，`noUnusedLocals` 表示是否在有没有使用的本地变量编译时报错，这些配置信息都可以在 [这里](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) 查询到。


### tslint.json


Tslint 对应于 Eslint 或者 Jslint，用于在不同时期进行检查，这里的配置也和 Eslint 非常相似。

比如有一些规则，每条有对应了不同的内容，比如使用单引号，不允许 `var` 关键字等，如果觉得开发习惯不同，可以根据 [官方规则](https://github.com/palantir/tslint) 进行调整。


如果你想知道 Tslint 有什么区别，可以查看 [这篇文章](https://ts.xcatliu.com/engineering/lint.html)


## 关于导出和导入

我们常用的导出有两种写法。

### export 变量

```js
// js 写法
function alert() {
}
exports.alert = alert;
exports.config = { a: 1 };
```

```ts
// ts 写法
export function alert() {
}

export const config = { a: 1 };

```

用 `export` 关键字即可。

### 默认导出

在以前我们很习惯 `module.exports` 来将整个对象进行导出，而切换到 ts 之后，请尽量不要使用这种做法。

```js
// js 写法
module.exports = {
  a: 1
};

module.exports = () => {
  console.log(111);
}
```

```ts
// ts 写法
export = {
  a: 1
};

export = () => {
  console.log(111);
}
```

::: warning 注意
两种写法无法并存，请尽量使用 `export` 进行导出。
:::

### default 导出

在很多时候，在代码中会有做 `default 导出的支持`，比如在 `egg-core` 中的加载部分:

```js
// require js module
const obj = require(filepath);
if (!obj) return obj;
// it's es module
if (obj.__esModule) return 'default' in obj ? obj.default : obj;
```

这个时候我们将代码写成如下也是可以支持的。

```ts
export default {

}
```

编译成 js，则会变成

```js
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
  
}
```

### 一般导入

一般情况下，我们在 js 上会使用 `require` 关键字进行导入，而在 ts 语法下，这样导入会丢失类型，所以在 ts 下写法有所不同。


```js
// js 写法
const applicatoin = require('midway').application;
const {applicatoin} = require('midway');
```

```ts
// ts 写法
import { applicatoin } from 'midway';
```

这样写，`midway` 包中的类型定义才可以被正常解析。

::: warning 注意
只有使用 `export` 进行导出的属性才能被 `import`，不然就需要换一种写法。
:::

### 默认导入

有时候，三方包或者内置模块是通过 `module.exports` 出来的。

```js
// js 写法
const path = require('path');
```

这个时候可以使用 `*` 做全部导出。

```ts
// ts 写法
import * as path from 'path';
```


## 相关链接

- [Typescript 入门教程](https://ts.xcatliu.com/)
- [Typescript Handbook](https://zhongsp.gitbooks.io/typescript-handbook/)
