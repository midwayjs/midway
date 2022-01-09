---
title: 修改源码目录
---

在某些特殊场景下，可以修改源码所在的 `src` 目录。
​

一些限制：

- 1、@midwayjs/web（egg）egg 由于目录固定，无法修改
- 2、只在纯 node 项目下测试通过（非一体化）

## 源码目录的修改

下面，我们以将 `src` 目录修改为 `server` 为例。

### dev 开发

`package.json` 中的 dev 命令需要增加源码目录，方便 dev 查找。

```typescript
"dev": "cross-env NODE_ENV=local midway-bin dev --sourceDir=./server --ts",
```

### build 编译

为了让 tsc 编译能找到源码目录，需要修改 `tsconfig.json` ，增加 `rootDir` 字段。

```typescript
{
  "compileOnSave": true,
  "compilerOptions": {
    // ...
    "rootDir": "server"
  },
}
```

这样，开发和编译就都正常了。
​

## 编译目录的修改

编译目录影响到部署，也可以修改。我们以将 `dist` 目录修改为 `build` 为例。

### build 编译

修改 `tsconfig.json` 中的 `outDir` 字段。

```typescript
{
  "compileOnSave": true,
  "compilerOptions": {
    // ...
    "outDir": "build"
  },
}
```

这样编译就正常了。
​

### bootstrap 启动

​

编译目录修改之后，线上部署会找不到代码，所以如果走 `bootstrap.js` 启动，需要修改代码。

```typescript
// bootstrap.js

const { join } = require('path');
const { Bootstrap } = require('@midwayjs/bootstrap');

//...

// 需要用 configure 方法配置 baseDir
Bootstrap.configure({
  baseDir: join(__dirname, 'build'),
})
  .load(web)
  .run();
```

对 `Bootstrap` 配置入口目录即可。
