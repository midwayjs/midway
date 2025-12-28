# 线程池

线程池组件 `@midwayjs/piscina` 基于 [Piscina](https://github.com/piscinajs/piscina) 提供在 Worker 线程池中执行任务的能力，适合 CPU 密集型计算，不会阻塞主线程。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

## 安装组件

```bash
$ npm i @midwayjs/piscina@4 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/piscina": "^4.0.0"
  }
}
```

## 引入组件

将组件配置到代码中。

```typescript
import { Configuration } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

@Configuration({
  imports: [
    piscina
  ],
  // ...
})
export class MainConfiguration {}
```

## 基础用法

框架基于 [文档](/docs/service_factory) 提供了 `PiscinaService` 和 `PiscinaServiceFactory`。

你可以创建单个或者多个线程池对象来管理线程。

以下是 [Piscina](https://github.com/piscinajs/piscina) 的基础用法。

注入 `PiscinaService` 并调用 `run` 方法执行任务：

```typescript
import { Inject, Provide } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

@Provide()
export class UserService {
  @Inject()
  piscinaService: piscina.PiscinaService;

  async heavyTask() {
    // 调用 compute 函数
    const result1 = await this.piscinaService.run({
      handler: 'compute',
      payload: { value: 10 },
    });
    console.log(result1); // 20

    // 调用 heavyComputation 函数
    const result2 = await this.piscinaService.run({
      handler: 'heavyComputation',
      payload: { data: [1, 2, 3, 4, 5] },
    });
    console.log(result2); // 15
  }
}
```

## 使用 Midway 容器

如果需要在 Worker 中使用 Midway 的依赖注入功能，我们需要在线程中单独在启动一个 Midway 环境。


### 1. 创建线程中的环境

你可以在主项目中单独创建一个目录用来保存线程代码，**必须** 使用 `defineConfiguration` 方法来创建入口。

目录结构如下：
```
➜  base-app git:(feat/support_background_task) ✗ tree
.
├── package.json
└── src
    ├── configuration.ts      ## 主项目入口
    └── worker                ## worker 目录
        ├── index.ts
        └── task.ts
```

我们可以在 Worker 目录中创建一个新 Midway 入口配置：

```typescript
// src/worker/index.ts
import { defineConfiguration } from '@midwayjs/core/functional';
import { CommonJSFileDetector } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

export default defineConfiguration({
  namespace: 'worker',
  detector: new CommonJSFileDetector(),
  imports: [piscina], // 导入 Piscina
});
```

### 2. 编写任务类

和 Midway 其他组件类似，使用 `@PiscinaTask` 装饰器定义任务：

```typescript
// src/worker/task.ts
import { PiscinaTask, IPiscinaTask } from '@midwayjs/piscina';

@PiscinaTask('calculate')
export class CalculateTask implements IPiscinaTask {
  async execute(payload: { a: number; b: number; operation: string }) {
    if (payload.operation === 'add') {
      return payload.a + payload.b;
    } else if (payload.operation === 'multiply') {
      return payload.a * payload.b;
    }
    throw new Error('Unknown operation');
  }
}

@PiscinaTask('square')
export class SquareTask implements IPiscinaTask {
  async execute(payload: { value: number }) {
    return payload.value * payload.value;
  }
}
```

`@PiscinaTask` 装饰器的参数为一个字符串，代表堆外暴露的 handler 名称。


### 3. 配置主应用

在主应用配置中指定 Worker 目录：

```typescript
// src/config/config.default.ts
import { join } from 'path';

export default {
  piscina: {
    client: {
      // 指定 worker 入口文件
      workerFile: join(__dirname, '../worker/index'),
    },
  },
};
```

主应用需要忽略 Worker 目录，避免冲突：

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { CommonJSFileDetector } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

@Configuration({
  imports: [piscina],
  detector: new CommonJSFileDetector({
    ignore: ['**/worker/**'], // 忽略 worker 目录
  }),
})
export class MainConfiguration {}
```

### 4. 执行容器任务

使用 `runInContainer` 方法执行 Worker 容器中的任务：

```typescript
@Provide()
export class UserService {
  @Inject()
  piscinaService: piscina.PiscinaService;

  async heavyTask() {
    // 执行 calculate 任务 - 乘法
    const result1 = await this.piscinaService.runInContainer('calculate', {
      a: 5,
      b: 6,
      operation: 'multiply',
    });
    console.log(result1); // 30

    // 执行 calculate 任务 - 加法
    const result2 = await this.piscinaService.runInContainer('calculate', {
      a: 10,
      b: 20,
      operation: 'add',
    });
    console.log(result2); // 30

    // 执行 square 任务
    const result3 = await this.piscinaService.runInContainer('square', {
      value: 7,
    });
    console.log(result3); // 49
  }
}
```

## 取消任务

使用 `AbortController` 可以取消正在运行的任务：

```typescript
@Provide()
export class UserService {
  @Inject()
  piscinaService: piscina.PiscinaService;

  async cancelableTask() {
    const abortController = new AbortController();

    // 3 秒后取消任务
    setTimeout(() => {
      abortController.abort();
    }, 3000);

    try {
      const result = await this.piscinaService.run(
        {
          handler: 'longRunning',
          payload: { duration: 10000 }, // 10 秒的任务
        },
        {
          signal: abortController.signal, // 传递 AbortSignal
        }
      );
    } catch (error) {
      console.error('任务被取消:', error);
    }
  }
}
```

## 多个 Worker Pool

可以配置多个 Worker Pool，每个 Pool 执行不同的任务：

```typescript
// src/config/config.default.ts
export default {
  piscina: {
    clients: {
      // 计算任务池
      compute: {
        workerFile: join(__dirname, '../worker/compute.worker'),
        maxThreads: 4,
      },
      // 图像处理任务池
      image: {
        workerFile: join(__dirname, '../worker/image.worker'),
        maxThreads: 2,
      },
    },
  },
};
```

使用不同的 Pool：

```typescript
@Provide()
export class UserService {
  @Inject()
  piscinaServiceFactory: piscina.PiscinaServiceFactory;

  async useDifferentPools() {
    // 使用计算池
    const computePool = this.piscinaServiceFactory.get('compute');
    const result1 = await computePool.run({
      handler: 'compute',
      payload: { value: 10 },
    });

    // 使用图像处理池
    const imagePool = this.piscinaServiceFactory.get('image');
    const result2 = await imagePool.run({
      handler: 'process',
      payload: { imagePath: '/path/to/image.jpg' },
    });
  }
}
```

## 配置选项

### 常用配置

[Piscina](https://github.com/piscinajs/piscina) 有非常丰富的线程配置。

```typescript
export default {
  piscina: {
    client: {
      workerFile: join(__dirname, '../worker/index'),
      minThreads: 1,           // 最小线程数
      maxThreads: 4,           // 最大线程数
      idleTimeout: 60000,      // 空闲超时（毫秒）
      maxQueue: 'auto',        // 最大队列长度
      concurrentTasksPerWorker: 1, // 每个 Worker 的并发任务数
    },
  },
};
```

### 多 Pool 配置

```typescript
export default {
  piscina: {
    clients: {
      default: {
        workerFile: join(__dirname, '../worker/default.worker'),
      },
      heavy: {
        workerFile: join(__dirname, '../worker/heavy.worker'),
        maxThreads: 8,
        idleTimeout: 30000,
      },
    },
  },
};
```

## Worker 文件路径说明

- 支持 `.ts` 和 `.js` 文件，框架会自动查找
- 建议使用不带扩展名的路径，框架按 `.js -> .ts -> .mjs -> .cjs` 顺序查找
- 生产环境编译后会自动找到对应的 `.js` 文件

```typescript
// 推荐：不带扩展名
workerFile: join(__dirname, '../worker/compute.worker')

// 也可以：显式指定扩展名
workerFile: join(__dirname, '../worker/compute.worker.js')
workerFile: join(__dirname, '../worker/compute.worker.ts')
```

## API 参考

### PiscinaService

#### run(task, options?)

执行普通 Worker 任务。

```typescript
await piscinaService.run(
  {
    handler: 'functionName',  // Worker 文件中导出的函数名
    payload: { /* 数据 */ },  // 传递给函数的参数
  },
  {
    signal: abortController.signal, // 可选：AbortSignal
    transferList: [],                // 可选：可转移对象列表
  }
);
```

#### runInContainer(handler, payload?, options?)

执行 Worker 容器中的 `@PiscinaTask` 任务。

```typescript
await piscinaService.runInContainer(
  'taskName',              // @PiscinaTask 装饰器的参数
  { /* 数据 */ },          // 传递给 execute 方法的参数
  {
    signal: abortController.signal, // 可选：AbortSignal
  }
);
```

## 最佳实践

### 适用场景

- CPU 密集型计算（数据处理、加密解密、图像处理）
- 耗时较长的同步操作
- 需要避免阻塞主线程的场景
- 需要并行处理大量任务的场景

### 选择合适的模式

**普通 Worker 模式**：
- 适合简单的纯函数计算
- 不需要依赖注入
- 性能开销更小

**Midway 容器模式**：
- 需要使用依赖注入
- 需要在 Worker 中使用其他服务
- 适合复杂的业务逻辑

### 注意事项

1. **数据传递**：传递给 Worker 的数据会被序列化，不支持函数、类实例等不可序列化对象
2. **线程数配置**：根据 CPU 核心数合理配置 `maxThreads`，避免过多线程导致上下文切换开销
3. **内存管理**：Worker 线程有独立的内存空间，注意避免内存泄漏
4. **错误处理**：Worker 中的错误会被捕获并传递回主线程，需要适当处理
5. **路径问题**：Worker 文件路径建议使用绝对路径（如 `join(__dirname, '../worker/xxx')`）

## 常见问题

### 如何传递大量数据？

对于大型数据（如 ArrayBuffer、Buffer），使用 `transferList` 避免数据复制：

```typescript
const buffer = new ArrayBuffer(1024 * 1024);
await piscinaService.run(
  { handler: 'process', payload: buffer },
  { transferList: [buffer] }
);
```
