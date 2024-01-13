# 开发工具

基于标准的 tsc 模块，midway 开发了一个简单的工具，用于本地开发和构建 ts 文件。

它的使用和标准 tsc 几乎一致。

```bash
$ npx mwtsc
```

等价于执行 `tsc` 命令。



## 常用命令

由于 mwtsc 基于 tsc 进行开发，它可以使用所有 tsc 的命令。

比如

```bash
# 监听模式
$ npx mwtsc --watch

# 使用不同的 tsconfig 文件
$ npx mwtsc --project tsconfig.production.json
```

更多的参数可以查询 [tsc cli 工具](https://www.typescriptlang.org/docs/handbook/compiler-options.html)。

下面介绍更多 midway 新增的参数。



## 运行指令

为了使得 tsc 在代码开发期生效，midway 提供了一个 `run` 参数，用于在 tsc 编译成功后执行一个文件，这和 `tsc-watch` 模块类似。

比如

```bash
$ mwtsc --watch --run @midwayjs/mock/app.js
```

上述命令会执行下面的逻辑：

* 1、编译代码，编译成功后执行 `@midwayjs/mock/app.js` 文件
* 2、如果修改代码，则会自动触发编译，杀掉上一次执行的文件之后，自动执行 `@midwayjs/mock/app.js` 文件

`run` 参数可以执行任意的 js 文件，midway 依靠这个参数本地开发。

比如

```bash
$ npx mwtsc --watch --run ./bootstrap.js
```

当然也可以配合其他参数一起使用。

```bash
$ npx mwtsc --watch --project tsconfig.production.json --run ./bootstrap.js
```

注意 `run` 命令必须放在最后，它之后的所有参数，都将传递给子进程。



## 框架配置

可以在 Midway 项目中用 mwtsc 进行开发测试，比如：

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=local mwtsc --watch --run @midwayjs/mock/app",
    "build": "cross-env rm -rf dist && tsc"
  },
}
```

这里的 `@midwayjs/mock/app` 指代的是 `@midwayjs/mock` 包中的 `app.js` 文件，这个文件用于本地开发时启动框架。针对 Serverless 环境，也有相应的启动文件。

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=local mwtsc --watch --run @midwayjs/mock/function",
  },
}
```



## 常用能力

### 调整端口

可以通过参数 `--port` 动态修改启动的 http 端口，这个参数的优先级高于代码中的端口配置。

```bash
$  npx mwtsc --watch --run @midwayjs/mock/app --port 7001
```



### 开启 https

框架内置了一个 https 证书用来本地测试，可以通过参数 `--ssl` 启用。

```bash
$  npx mwtsc --watch --run @midwayjs/mock/app --ssl
```

