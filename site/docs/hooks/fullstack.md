---
title: 全栈套件
---

在 Midway Hooks 中，我们提供了 `@midwayjs/hooks-kit` 来快速开发全栈应用。目前我们提供了以下可直接使用的模版：

- [react](https://github.com/midwayjs/hooks/blob/main/examples/react)
- [vue](https://github.com/midwayjs/hooks/blob/main/examples/vue)
- [prisma](https://github.com/midwayjs/hooks/blob/main/examples/prisma)

## 命令行界面

在使用了 `@midwayjs/hooks-kit` 的项目中，可以在 npm scripts 中使用 hooks 可执行文件，或者通过 `npx hooks` 运行。下面是通过脚手架创建的 Midway 全栈项目中默认的 npm scripts：

```json
{
  "scripts": {
    "dev": "hooks dev", // 启动开发服务器
    "start": "hooks start", // 启动生产服务器，使用前请确保已运行 `npm run build`
    "build": "hooks build" // 为生产环境构建产物
  }
}
```

在使用命令行时，可以通过命令行参数传入选项，具体选项可以通过 --help 参考。

如：`hooks build --help`

输出：

```
Usage:
  $ hooks build [root]

Options:
  --outDir <dir>  [string] output directory (default: dist)
  --clean         [boolean] clean output directory before build (default: false)
  -h, --help      Display this message
```
