---
title: 部署
---

### 构建打包

由于 TypeScript 的特殊性，本地开发可以有 ts-node 等类似的工具进行开发，而在服务器端运行的时候，我们希望可以通过 js 来运行，这中间就需要编译工具。

幸好 TypeScript 官方提供了 tsc 工具来帮助这个过程，而编译时会自动调用 `tsconfig.json` 来做一些编译时处理，midway 默认提供了一份该文件，用户也可以进行自定义。

同时，在脚手架中，我们提供了 `build` 命令帮助用户更好的生成文件。

:::info
推荐在发布前本地进行 build，并通过 npm run start_build 进行启动尝试，减少服务器端构建错误。
:::

```bash
"start_build": "npm run build && NODE_ENV=development midway-bin dev"
```

通过 start_build 启动的应用，将会自动本地编译，然后启动 dist 目录中的文件。

如果有一些自定义的文件需要在打包时拷贝，可以参考 [自定义打包](tool_set.md#build-%E5%91%BD%E4%BB%A4)

### 通过内置的启动文件

midway 提供了一个内置的 `server.js` 来作为应用的启动入口，在大部分情况下，可以通过直接 require 该文件来进行启动。

比如使用 pm2 的场景下。

```javascript
// xxx.js
require('midway/server');
```

或者使用我们 pandora 的场景下，会生成 procfile.js 文件，内容如下。

```javascript
'use strict';

module.exports = (pandora) => {
  pandora.fork('[your app name]', require.resolve('midway/server'));
};
```

通过内置的 server 文件，可以自动启动应用。

### egg-scripts 方式

在以往的 egg 应用中，egg-scripts 也可以直接启动，但是不支持 [启动参数传递](#%E5%90%AF%E5%8A%A8%E5%8F%82%E6%95%B0%E4%BC%A0%E9%80%92) 。

具体的文档请查看 [使用 egg-scripts 应用部署](https://eggjs.org/zh-cn/core/deployment.html)。

### 启动参数传递

我们设计了一个机制，在 package.json 中配置服务器设置，只有依赖了 `midway/server` 文件才可以使用。

支持的参数见 [启动参数](https://github.com/eggjs/egg-cluster/blob/master/lib/master.js#L33)，同时，midway 框架额外增加了几个参数。

- typescript {boolean} 如果为 true，则会开启 ts 模式，加载 src 或者 dist 目录，默认内部会进行判断，无需手动处理
- srcDir {string} 源码路径，默认为 src
- targetDir {string} 编译后路径，默认为 dist

```json
{
  "midway-server-options": {
    "workers": 1,
    "port": 3000
  }
}
```

如果觉得不足，还可以使用 js 或者 json 文件进行定义。

```javascript
{
  "midway-server-options": "./server.json"    // xxx.js
}

// in json
{
  "workers": 1
}

// in js
module.exports = {
  workers: 1
}
```

## 其他一些情况

### windows 支持

由于在 windows 上开发体验不是特别友好，以及一些库缺乏支持，在大部分情况下，我们优先推荐在 mac/linux 下开发 Node.js 应用。

需要注意的是，由于 windows 对设置环境变量的同步，默认生成的脚手架可能需要调整，主要是环境变量的部分。

比如开发命令，在设置环境的时候需要使用 `set` 以及中间需要增加 `&&` 以连接命令。

```json
{
  "dev": "set NODE_ENV=local && midway-bin dev --ts"
}
```
