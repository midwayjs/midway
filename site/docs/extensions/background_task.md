# 后台异步任务

`@midwayjs/background-task` 提供在本地进程中执行一次性或临时的后台异步任务能力，适合需要在应用生命周期内异步处理但不需要定时/队列的场景。它提供装饰器 `@BackgroundTask` 用于声明任务类，以及框架 API 动态创建并执行任务。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ✅    |

## 安装组件

```bash
$ npm i @midwayjs/background-task@4 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/background-task": "^4.0.0"
  }
}
```

## 使用组件

将组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as backgroundTask from '@midwayjs/background-task';

@Configuration({
  imports: [
    backgroundTask
  ]
})
export class MainConfiguration {}
```

## 编写任务处理类

使用 `@BackgroundTask` 装饰器装饰一个类，用于定义一个后台任务处理器。任务类需要实现 `IBackgroundTask` 接口的 `execute` 方法，返回结果会作为该任务的完成值。

```typescript
// src/task/hello.task.ts
import { BackgroundTask, IBackgroundTask } from '@midwayjs/background-task';

@BackgroundTask('HelloBackgroundTask')
export class HelloBackgroundTask implements IBackgroundTask {
  async execute() {
    // 执行一次性的后台逻辑
    return 'ok';
  }

  async onComplete(result: any) {}
}
```

当应用启动后，框架会自动发现并执行带有 `@BackgroundTask` 的类。

## 动态创建任务

除了声明式任务，框架还提供运行时 API 用于动态创建并执行任务。

```typescript
import { Inject } from '@midwayjs/core';
import * as backgroundTask from '@midwayjs/background-task';

export class SomeService {
  @Inject()
  framework: backgroundTask.Framework;

  async run() {
    await this.framework.createTask('dynTask', async (ctx) => {
      // 在 ctx 中可访问 logger、requestContext，以及 app（ctx.app）
      return 1;
    }, async (result) => {
      // 可选的完成回调
    });
  }
}
```

`createTask(name, executor, onComplete?)` 会返回该任务的 `Promise`，同时以 `name` 为键记录在框架中，可通过 `getTask(name)` 获取。

## 任务对象注入与获取

- 通过属性装饰器注入：

```typescript
import { InjectTask } from '@midwayjs/background-task';

export class ContainerConfiguration {
  @InjectTask('HelloBackgroundTask')
  helloTask: Promise<any>;
}
```

- 通过框架 API 获取：

```typescript
import { Inject } from '@midwayjs/core';
import * as backgroundTask from '@midwayjs/background-task';

export class ContainerConfiguration {
  @Inject()
  framework: backgroundTask.Framework;

  async onServerReady() {
    const p = this.framework.getTask('HelloBackgroundTask');
  }
}
```

:::caution
任务对象需要在 `onServerReady` 生命周期或者应用启动之后才能获取。
:::

## 上下文

后台任务执行发生在请求作用域，其 Context 结构如下：

```typescript
export interface Context extends IMidwayContext {
  from: any;    // 任务来源（类或名称）
  app: any;     // 主应用对象，便于设置属性或读取配置
}
```

## 组件日志

组件有着独立的日志客户端 `backgroundTaskLogger`，默认会将 `ctx.logger` 记录在 `midway-background-task.log` 中。

可以通过如下配置调整：

```typescript
export default {
  midwayLogger: {
    clients: {
      backgroundTaskLogger: {
        fileLogName: 'midway-background-task.log'
      }
    }
  }
}
```

## 配置项

当前组件无需额外必填配置，后续如需增加并发、队列或重试策略，可在 `BackgroundTaskOptions` 中扩展并通过 `Configuration` 提供默认值。
