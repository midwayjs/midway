# 开发函数

## 初始化代码

让我们来开发第一个纯 HTTP 函数，来尝试将它部署到云环境。

执行 `npm init midway`，选择 `faas` 脚手架。



## 目录结构

以下就是一个函数的最精简的结构，核心会包括一个 `f.yml` 标准化函数文件，以及 TypeScript 的项目结构。

```bash
.
├── f.yml           	# 标准化 spec 文件
├── package.json    	# 项目依赖
├── src
│   └── function
│       └── hello.ts	## 函数文件
└── tsconfig.json
```

我们来简单了解一下文件内容。

- `f.yml`  函数定义文件
- `tsconfig.json` TypeScript 配置文件
- `src` 函数源码目录
- `src/function/hello.ts` 示例函数文件

我们将函数放在 `function`目录下，是为了更好的和其他类型的代码分开。

## 函数文件

我们首先来看看函数文件，传统的函数是一个 `function` ，为了更符合 midway 体系，以及使用我们的依赖注入，这里将它变成了 Class。

通过 `@ServerlessTrigger` 装饰器，我们将方法标注为一个 HTTP 接口，并且标示 `path` 和 `method` 属性。

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midway') {
    return `hello ${name}`;
  }
}
```

除了触发器外，我们还可以使用 `@ServerlessFunction` 装饰器描述函数层面的元信息，比如函数名，并发度等等。


这样，当我们在一个函数上，使用多个触发器时，就可以这样设置。

```typescript
import { Provide, Inject, ServerlessFunction, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloServerlessService {
  @Inject()
  ctx: Context;

  // 一个函数多个触发器
  @ServerlessFunction({
    functionName: 'abcde',
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    name: 'timer'
  })
  async handleTimerEvent() {
    // TODO
  }
}
```

:::caution
注意，有些平台无法将不同类型的触发器放在同一个函数中，比如阿里云规定，HTTP 触发器和其他触发器不能同时在一个函数生效。
:::

## 函数定义文件

`f.yml` 是框架识别函数信息的文件，内容如下。

```yaml
provider:
  name: aliyun  # 发布的平台，这里是阿里云
  starter: '@midwayjs/fc-starter'

```

这里的 `@midwayjs/fc-starter` 就是适配 aliyun 函数的适配器。



## 触发器装饰器参数

`@ServerlessTrigger` 装饰器用于定义不同的触发器，它的参数为每个触发器信息，以及通用触发器参数。

比如触发器的名称修改为 abc。

```typescript
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    name: 'abc',	// 触发器名称
  })
```

如果只有一个触发器，可以将函数名信息写入到触发器上。

```typescript
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
  	functionName: 'hello'	// 如果只有一个触发器，可以省略一个装饰器
    name: 'abc',
  })
```



## 函数装饰器参数

`@ServerlessFunction` 装饰器用于定义函数，如果有多个触发器，通过它可以统一修改函数名。


比如：

```typescript
@ServerlessFunction({
  functionName: 'abcde'	// 函数名称
})
```

## 本地开发

HTTP 函数本地开发和传统 Web 相同，输入以下命令。

```shell
$ npm run dev
$ open http://localhost:7001
```

Midway 会启动 HTTP 服务器，打开浏览器，访问 [http://127.0.0.1:7001](http://127.0.0.1:7001) ，浏览器会打印出 `Hello midwayjs`  的信息。

非 HTTP 函数，无法直接触发，作为代替，可以编写测试函数执行。

