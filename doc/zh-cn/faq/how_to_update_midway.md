# 如何更新 Midway

## midway 项目的依赖使用 lerna 发布，**请不要**：


- 1、单独升级某个 @midwayjs/* 的包
- 2、将 package.json 中的版本号移除 ^ 符号


## 普通项目更新


普通使用 npm/yarn 的项目，升级请按照下面的流程


- 1、删除 package-lock.json 或者 yarn.lock
- 2、彻底删除 node_modules（比如 rm -rf node_modules)
- 3、重新安装依赖（ npm install 或者 yarn）



**我们不保证使用其他工具、cli 单独升级包的效果。**


## lerna 项目更新


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