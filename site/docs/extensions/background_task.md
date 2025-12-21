# 后台异步任务

`@midwayjs/background-task` 提供在本地进程中执行后台异步任务的能力。支持两种执行模式：

- **主线程模式 (PROMISE)**：在主进程中异步执行，适合 I/O 密集型任务
- **Worker 线程模式 (THREAD)**：在独立 Worker 线程中执行，适合 CPU 密集型计算

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

## 主线程模式 - runInBackground

使用 `runInBackground` 在主线程中执行任务，支持函数和类两种方式。

### 函数方式

```typescript
import { Inject } from '@midwayjs/core';
import * as backgroundTask from '@midwayjs/background-task';

export class SomeService {
  @Inject()
  framework: backgroundTask.Framework;

  async run() {
    // 最简单的用法
    const result = await this.framework.runInBackground(async () => {
      return 42;
    });

    // 传递参数
    const result2 = await this.framework.runInBackground(
      async (payload) => {
        return payload.value * 2;
      },
      {
        payload: { value: 10 },
      }
    );

    // 完整选项
    await this.framework.runInBackground(
      async (payload) => {
        return payload.value + 1;
      },
      {
        payload: { value: 10 },
        taskName: 'myTask',
        onComplete: (result) => {
          console.log('任务完成:', result);
        },
        onError: (error) => {
          console.error('任务失败:', error);
        },
      }
    );
  }
}
```

### 类方式

定义一个实现 `IBackgroundTask` 接口的类：

```typescript
// src/task/compute.task.ts
import { Provide } from '@midwayjs/core';
import { IBackgroundTask } from '@midwayjs/background-task';

@Provide()
export class ComputeTask implements IBackgroundTask<{ value: number }, number> {
  async execute(payload: { value: number }) {
    // 执行计算逻辑
    return payload.value * 2;
  }
}
```

然后在服务中使用：

```typescript
import { Inject } from '@midwayjs/core';
import * as backgroundTask from '@midwayjs/background-task';
import { ComputeTask } from './task/compute.task';

export class SomeService {
  @Inject()
  framework: backgroundTask.Framework;

  async run() {
    const result = await this.framework.runInBackground(ComputeTask, {
      payload: { value: 10 },
      onComplete: (result) => {
        console.log('计算完成:', result); // 20
      },
    });
  }
}
```

## Worker 线程模式 - runInWorkerThread

使用 `runInWorkerThread` 在独立的 Worker 线程中执行任务，适合 CPU 密集型计算，不会阻塞主线程。

### 编写 Worker 文件

首先创建一个 Worker 文件：

```typescript
// src/worker/compute.worker.ts

/**
 * 计算任务处理函数
 */
export async function compute(payload?: { value: number }) {
  // CPU 密集型计算
  return (payload?.value || 0) * 2;
}

/**
 * 也可以导出多个处理函数
 */
export async function heavyComputation(payload?: { data: number[] }) {
  // 模拟耗时计算
  return payload?.data.reduce((a, b) => a + b, 0);
}
```

### 调用 Worker

```typescript
import { Inject } from '@midwayjs/core';
import { join } from 'path';
import * as backgroundTask from '@midwayjs/background-task';

export class SomeService {
  @Inject()
  framework: backgroundTask.Framework;

  async run() {
    // 指定 worker 文件路径和处理函数
    const result = await this.framework.runInWorkerThread(
      join(__dirname, '../worker/compute.worker'),
      {
        handler: 'compute',
        payload: { value: 10 },
        onComplete: (result) => {
          console.log('Worker 完成:', result); // 20
        },
      }
    );

    // 调用不同的处理函数
    const sum = await this.framework.runInWorkerThread(
      join(__dirname, '../worker/compute.worker'),
      {
        handler: 'heavyComputation',
        payload: { data: [1, 2, 3, 4, 5] },
      }
    );
  }
}
```

### Worker 文件路径说明

- 支持 `.ts` 和 `.js` 文件，框架会自动查找
- 建议使用不带扩展名的路径，框架按 `.js -> .ts -> .mjs -> .cjs` 顺序查找
- 生产环境编译后会自动找到对应的 `.js` 文件

```typescript
// 推荐：不带扩展名
join(__dirname, '../worker/compute.worker')

// 也可以：显式指定扩展名
join(__dirname, '../worker/compute.worker.js')
join(__dirname, '../worker/compute.worker.ts')
```

## 任务管理

### 获取任务

```typescript
// 通过任务名称获取任务 Promise
const taskPromise = this.framework.getTask('myTask');
if (taskPromise) {
  const result = await taskPromise;
}
```

### 获取任务状态

```typescript
const status = this.framework.getTaskStatus('myTask');
// status.status: 'running' | 'completed' | 'failed'
// status.strategy: 'promise' | 'thread'
```

### 获取所有任务

```typescript
const allTasks = this.framework.getAllTasks();
// Map<string, TaskEntry>
```

## 配置选项

### Piscina 线程池配置

可以通过配置自定义 Piscina 线程池参数：

```typescript
// src/config/config.default.ts
export default {
  backgroundTask: {
    piscina: {
      minThreads: 1,
      maxThreads: 4,
      idleTimeout: 60000,
    },
  },
};
```

## 组件日志

组件有独立的日志客户端 `backgroundTaskLogger`，默认记录在 `midway-background-task.log` 中。

可以通过如下配置调整：

```typescript
export default {
  midwayLogger: {
    clients: {
      backgroundTaskLogger: {
        fileLogName: 'midway-background-task.log',
      },
    },
  },
};
```

## API 参考

### runInBackground(executor, options?)

在主线程中执行任务。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| executor | `Function \| Class` | 执行函数或实现 IBackgroundTask 的类 |
| options.payload | `any` | 传递给任务的参数 |
| options.taskName | `string` | 任务名称，用于日志和获取任务 |
| options.onComplete | `(result) => void` | 任务成功回调 |
| options.onError | `(error) => void` | 任务失败回调 |

### runInWorkerThread(workerFile, options?)

在 Worker 线程中执行任务。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| workerFile | `string` | Worker 文件的绝对路径 |
| options.handler | `string` | 导出的处理函数名 |
| options.payload | `any` | 传递给任务的参数 |
| options.taskName | `string` | 任务名称，用于日志和获取任务 |
| options.onComplete | `(result) => void` | 任务成功回调 |
| options.onError | `(error) => void` | 任务失败回调 |

### getTask(name)

获取指定名称的任务 Promise。

### getTaskStatus(name)

获取指定名称的任务状态。

### getAllTasks()

获取所有任务的 Map。

## 最佳实践

### 何时使用主线程模式

- I/O 密集型操作（网络请求、文件读写）
- 快速完成的任务
- 需要访问主进程中的服务和依赖注入

### 何时使用 Worker 线程模式

- CPU 密集型计算（数据处理、加密解密）
- 耗时较长的同步操作
- 需要避免阻塞主线程的场景

### 注意事项

1. Worker 线程中无法直接使用依赖注入，需要在 Worker 文件中独立处理
2. Worker 文件中的代码需要是可序列化的纯函数
3. 传递给 Worker 的 payload 会被序列化，不支持函数、类实例等
