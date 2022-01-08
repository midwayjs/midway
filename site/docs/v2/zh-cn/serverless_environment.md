---
title: 部署环境
---

在 Serverless 场景，由于环境和传统的容器不同（平台提供，无法修改），我们在启动时，使用传统的命令透传环境变量，函数是无法正确的读取到的。

比如，下面的命令，只能对本地生效，无法对服务器生效。

```bash
$ NODE_ENV midway-bin deploy			// 错误写法，只在本地生效
```

我们需要特殊的方式来让函数容器也能接收到环境。

## 发布环境变量

为了和普通的环境变量区分，部署到平台的环境变量使用 `UDEV_` （User Defined Environment Variable）前缀，并且**会在发布后写入到发布的 yml 文件对应的 environment 字段中。**

例如：

```bash
$ UDEV_NODE_ENV=prod midway-bin deploy
```

这个时候在平台将会接收到名为 `NODE_ENV` ，值为 `prod`  的环境变量。

## YML 变量填充

在 yml 中可以使用填充一些变量，我们提供了一个默认填充关键字 `env` ，通过它可以对任意的 yml 变量赋值。比如：

```yaml
provider:
	runtime: ${env.RUNTIME}
```

那么，如果 `midway-bin deploy` 时增加的环境变量为 `RUNTIME=nodejs10 midway-bin deploy` ，则会被填充为：

```yaml
provider:
	runtime: nodejs10
```

## 错误堆栈输出

当函数报错时，Midway 会自动在函数日志中输出错误信息，包括堆栈等。但是只会在 `local` 和 `development` 环境将报错堆栈在响应（Response）中输出。

如果需要在其他环境的返回值中看到错误堆栈，可以通过配置下面的环境变量。

```typescript
process.env.SERVERLESS_OUTPUT_ERROR_STACK = 'true';
```

## 拷贝额外资源

默认构建工具只会拷贝 package.json、构建后的代码和依赖，如果需要拷贝其他目录，比如一些静态资源，需要在 `f.yml` 中配置。

比如：

```yaml
package:										# 打包配置
  include:									# 打包包含文件列表，默认为 package.json、构建后的代码和依赖
  	- resource
    - public
  exclude:									# 打包剔除文件列表
  	- test
```
