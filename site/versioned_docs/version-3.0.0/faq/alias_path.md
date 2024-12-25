# 关于 Alias Path

我们并不建议使用 Alias Path， Node 和 TS 原生不支持这个功能，即使有，现在也是通过各种 Hack 手段来实现（从 v18 开始，Node.js 已经有 exports 的方案，但是类型还未支持，可以等后续）。

如果你一定想要使用，请往下看。

## 本地开发的支持（dev 阶段）

tsc 将 ts 编译成 js 的时候，并不会去转换 import 的模块路径，因此当你在 `tsconfig.json` 中配置了 paths 之后，如果你在 ts 中使用 paths 并 import 了对应模块，编译成 js 的时候就有大概率出现模块找不到的情况。

解决办法是，要么不用 paths ，要么使用 paths 的时候只用来 import 一些声明而非具体值，再要么就可以使用 [tsconfig-paths](https://github.com/dividab/tsconfig-paths) 来 hook 掉 node 中的模块路径解析逻辑，从而支持 `tsconfig.json` 中的 paths。

```bash
$ npm i tsconfig-paths --save-dev
```

使用 tsconfig-paths 可以在 `src/configuration.ts` 中引入。

```typescript
// src/configuration.ts

import 'tsconfig-paths/register';
// ...
```

:::info

上述的方法只会对 dev 阶段（ ts-node）生效。

:::



## 测试的支持（jest test）

在测试中，由于 Jest 的环境比较特殊，需要对 alias 再做一次处理，可以利用 Jest 的配置文件中的 `moduleNameMapper` 功能来替换加载到的模块，变相实现 alias 的功能。

```typescript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

注意，这里使用的 alias 前缀是 @符号，如果是其他的 alias 名，请自行修改。



## 运行时的支持

 `tsconfig-paths` 是在 ts 运行后在内存中替换路径，编译后依旧会输出带 @符号的路径，使得部署后找不到文件，社区有一些库会在 ts 编译做一些替换支持。

比如：

- https://github.com/justkey007/tsc-alias



## 其他

老版本 CLI 中预埋了一个 mwcc 编译器，基于固定 TS 版本在构建器替换 Alias 内容，但是由于依赖 TS 私有 API 导致无法升级 TS 版本，无法享受到新版本的功能。

我们从 CLI 2.0 版本开始，移除了这个编译器。