# ESModule 使用指南

在过去的几年中，Node.js一直致力于支持运行 ECMAScript模块 (ESM)。这是一个很难支持的功能，因为 Node.js 生态系统的基础是建立在一个不同的模块系统，称为 CommonJS (CJS)。

两个模块系统之间的互操作带来了巨大的挑战，并具有许多新功能。但是，现在在Node.js中实现了对 ESM 的支持，并且尘埃落定。

在此基础上，Midway 也支持了 ESM 格式的文件加载，业务也可以使用这种全新的模块加载方式来构建自己的业务。



## 脚手架

由于改动较多，Midway 提供了全新的 ESM 格式的脚手架，如有 ESM 的需求，我们推荐用户重新创建后再来开发业务。



## 配置方式

### package.json 的变化

 `package.json` 中的 type 必须设置为 `module`。

```json
{
  "name": "my-package",
  "type": "module",
  "//": "...",
  "dependencies": {
  }
}
```



### tsconfig.json 中的变化

`compilerOptions` 编译相关的选项需要设置为 `Node16` 或者 `NodeNext`。

```json
{
  "compilerOptions": {
    "target": "NodeNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    // ...
  }
}
```



### jest.config.js 的变化

```javascript
module.exports = {
  roots: ['<rootDir>/scripts'],
  testMatch: ['**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
}
```



## 一些变化

1、ts 中，import 的文件必须指定后缀名，且后缀名为 js

```typescript
import { helper } from "./foo.js"; // works in ESM & CJS
```



2、你不能再使用 `module.exports` 或者 `exports.` 来导出

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





## 一些资料

- https://www.typescriptlang.org/docs/handbook/esm-node.html
- https://japanese-document.github.io/tips/2022/typescript-ts-node-esmodules.html