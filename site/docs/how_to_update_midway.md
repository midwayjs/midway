# 如何更新 Midway



## 什么时候要更新 Midway

一般来说，在下面的情况下，你可能需要更新：

- 1、Midway 发了新版本之后，你希望用到新功能的时候
- 2、你安装了一个新的组件且带有 lock 文件的时候
- 3、出现方法找不到的错误的时候
- ... 等等

比如出现下面错误的时候

1、一般是装了组件的新包，但是老的 @midwayjs/core 未包含该方法从而报错。

![](https://img.alicdn.com/imgextra/i3/O1CN01dDNRZr1MBPewPo7Xg_!!6000000001396-2-tps-1196-317.png)

2、一般原因为 mock 依赖的 @midwayjs/core 版本没这个方法，说明版本不对，可能是错误引用了版本，也可能是版本太低

![](https://img.alicdn.com/imgextra/i3/O1CN01HVMJKP1xNuFO2Wv73_!!6000000006432-2-tps-1055-135.png)

3、新装组件的时候，我们发现某个包的版本实例不止一个

![](https://img.alicdn.com/imgextra/i3/O1CN01jZxQu91YBCs0N9S9Y_!!6000000003020-2-tps-1133-43.png)

## 更新注意事项

:::danger

midway 项目的依赖使用 lerna 发布，**请不要**：


- 1、单独升级某个 @midwayjs/* 的包
- 2、将 package.json 中的版本号移除 ^ 符号

:::



## 检查包版本异常

你可以使用下面的命令在项目根目录执行进行检查。

```bash
# 社区用户
$ npx midway-version
# 内部用户
$ tnpx @ali/midway-version
```

如果项目为 pnpm 安装的依赖，请使用下面的命令。

```bash
# 社区用户
$ pnpx midway-version
# 内部用户
$ pnpx @ali/midway-version
```



## 使用工具更新版本

你可以使用下面的命令在项目根目录执行进行更新提示。

```bash
# 社区用户
$ npx midway-version -u
# 内部用户
$ tnpx @ali/midway-version -u
```

如果项目为 pnpm 安装的依赖，请使用下面的命令。

```bash
# 社区用户
$ pnpx midway-version -u
# 内部用户
$ pnpx @ali/midway-version -u
```

如果你希望将更新写入到 `package.json` 中，请使用下面的命令。

```bash
# 社区用户
$ npx midway-version -u -w
# 内部用户
$ tnpx @ali/midway-version -u -w
```

如果项目为 pnpm 安装的依赖，请使用下面的命令。

```bash
# 社区用户
$ pnpx midway-version -u -w
# 内部用户
$ pnpx @ali/midway-version -u -w
```

:::tip

更新的版本会写入 `package.json` 和 `package-lock.json`，并需要重新安装依赖。

:::



## 手动更新版本


### 普通项目更新


普通使用 npm/yarn 的项目，升级请按照下面的流程


- 1、删除 package-lock.json 或者 yarn.lock
- 2、彻底删除 node_modules（比如 rm -rf node_modules)
- 3、重新安装依赖（ npm install 或者 yarn）



**我们不保证使用其他工具、cli 单独升级包的效果。**




### lerna 项目更新


使用 lerna 开发项目，由于有 hoist 模式的存在，升级请按照下面的流程（以 lerna3 为例）



- 1、清理子包的 node_modules，比如（lerna clean --yes）
- 2、删除主包的 node_modules（比如 rm -rf node_modules)
- 3、删除 package-lock.json 或者 yarn.lock
- 4、重新安装依赖（ npm install && lerna bootstrap）



**我们不保证使用其他工具、cli 单独升级包的效果。**




## 大版本更新


请手动修改版本号，比如从 `^1.0.0` 修改为 `^2.0.0` 。



## 查看当前包版本


Midway 包采用标准的 Semver 版本进行管理和发布，在 `package.json` 指定的版本一般为 `^` 开头，表示在大版本范围内都兼容。


比如，`package.json` 中 `@midwayjs/core` 为 `^2.3.0` ，那么按照 npm 安装规则，会安装 `2.x` 这个版本下最新的 latest 版本。


所以实际安装的版本高于 `package.json` 中指定的版本都是正常的。


你可以使用 `npm ls 包名` 来查看具体的版本，比如 `npm ls @midwayjs/core` 来查看 `@midwayjs/core` 的版本。


## 版本匹配查询


由于 lerna 发包有一定的依赖性，比如修改到的包才会更新，就会出现 **midway 下的包版本不一定完全一致的情况。**


比如，`@midwayjs/web` 的版本高于 `@midwayjs/core`，这都是很正常的。


midway 每次发布会提交一个 [@midwayjs/version ](https://www.npmjs.com/package/@midwayjs/version)的包，其中包含了我们每个版本，以及该版本的包所匹配的全部包版本，请 [访问这里](https://github.com/midwayjs/midway/tree/2.x/packages/version/versions) 查看。


目录中的文件名按照 `@midwayjs/decorator版本 - @midwayjs/core版本.json` 规则创建，每个版本对应一个 JSON 文件。


文件内容以包名作为 key，以可兼容匹配的版本名作为值。


比如，当前文件 decorator(v2.10.18)和 core(v2.10.18) 所能兼容的 egg-layer 包版本为 v2.10.18 和 v2.10.19。


如果 decorator 和 core 组合的文件名未找到，或者文件里的版本不匹配，都说明 **版本可能产生了问题**。


内容示例如下：
```json
{
  "@midwayjs/egg-layer": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/express-layer": "2.10.18",
  "@midwayjs/faas-typings": "2.10.7",
  "@midwayjs/koa-layer": "2.10.18",
  "@midwayjs/runtime-engine": "2.10.14",
  "@midwayjs/runtime-mock": "2.10.14",
  "@midwayjs/serverless-app": "2.10.18",
  "@midwayjs/serverless-aws-starter": "2.10.14",
  "@midwayjs/serverless-fc-starter": "2.10.18",
  "@midwayjs/serverless-fc-trigger": "2.10.18",
  "@midwayjs/serverless-http-parser": "2.10.7",
  "@midwayjs/serverless-scf-starter": "2.10.14",
  "@midwayjs/serverless-scf-trigger": "2.10.18",
  "@midwayjs/static-layer": "2.10.18",
  "@midwayjs/bootstrap": "2.10.18",
  "@midwayjs/cache": "2.10.18",
  "@midwayjs/consul": "2.10.18",
  "@midwayjs/core": "2.10.18",
  "@midwayjs/decorator": "2.10.18",
  "@midwayjs/faas": "2.10.18",
  "@midwayjs/grpc": "2.10.18",
  "@midwayjs/logger": "2.10.18",
  "midway-schedule": "2.10.18",
  "midway": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/mock": "2.10.18",
  "@midwayjs/prometheus": "2.10.18",
  "@midwayjs/rabbitmq": "2.10.18",
  "@midwayjs/socketio": "2.10.18",
  "@midwayjs/task": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/typegoose": "2.10.18",
  "@midwayjs/version": [
    "2.10.18",
    "2.10.19"
  ],
  "@midwayjs/express": "2.10.18",
  "@midwayjs/koa": "2.10.18",
  "@midwayjs/web": [
    "2.10.18",
    "2.10.19"
  ]
}
```