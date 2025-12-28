# Thread Pool

The thread pool component `@midwayjs/piscina` provides the ability to execute tasks in a Worker thread pool based on [Piscina](https://github.com/piscinajs/piscina), suitable for CPU-intensive calculations without blocking the main thread.

Related Information:

| Description              |      |
| ----------------- | ---- |
| Standard Project    | ✅    |
| Serverless | ❌    |
| Integration      | ✅    |
| Independent Main Framework    | ❌    |
| Independent Logger      | ❌    |

## Installation

```bash
$ npm i @midwayjs/piscina@4 --save
```

Or add the following dependency to `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/piscina": "^4.0.0"
  }
}
```

## Usage

Add the component to your configuration.

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

## Basic Usage

The framework provides `PiscinaService` and `PiscinaServiceFactory` based on [Service Factory](/docs/service_factory).

You can create single or multiple thread pool objects to manage threads.

Here is the basic usage of [Piscina](https://github.com/piscinajs/piscina).

Inject `PiscinaService` and call the `run` method to execute tasks:

```typescript
import { Inject, Provide } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

@Provide()
export class UserService {
  @Inject()
  piscinaService: piscina.PiscinaService;

  async heavyTask() {
    // Call compute function
    const result1 = await this.piscinaService.run({
      handler: 'compute',
      payload: { value: 10 },
    });
    console.log(result1); // 20

    // Call heavyComputation function
    const result2 = await this.piscinaService.run({
      handler: 'heavyComputation',
      payload: { data: [1, 2, 3, 4, 5] },
    });
    console.log(result2); // 15
  }
}
```

## Using Midway Container

If you need to use Midway's dependency injection in the Worker, we need to start a separate Midway environment in the thread.

### 1. Create Environment in Thread

You can create a separate directory in the main project to save thread code. You **must** use the `defineConfiguration` method to create the entry.

The directory structure is as follows:
```
➜  base-app git:(feat/support_background_task) ✗ tree
.
├── package.json
└── src
    ├── configuration.ts      ## Main project entry
    └── worker                ## Worker directory
        ├── index.ts
        └── task.ts
```

We can create a new Midway entry configuration in the Worker directory:

```typescript
// src/worker/index.ts
import { defineConfiguration } from '@midwayjs/core/functional';
import { CommonJSFileDetector } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

export default defineConfiguration({
  namespace: 'worker',
  detector: new CommonJSFileDetector(),
  imports: [piscina], // Import Piscina
});
```

### 2. Write Task Class

Similar to other Midway components, use the `@PiscinaTask` decorator to define tasks:

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

The parameter of the `@PiscinaTask` decorator is a string, representing the handler name exposed to the outside.

### 3. Configure Main Application

Specify the Worker directory in the main application configuration:

```typescript
// src/config/config.default.ts
import { join } from 'path';

export default {
  piscina: {
    client: {
      // Specify worker entry file
      workerFile: join(__dirname, '../worker/index'),
    },
  },
};
```

The main application needs to ignore the Worker directory to avoid conflicts:

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import { CommonJSFileDetector } from '@midwayjs/core';
import * as piscina from '@midwayjs/piscina';

@Configuration({
  imports: [piscina],
  detector: new CommonJSFileDetector({
    ignore: ['**/worker/**'], // Ignore worker directory
  }),
})
export class MainConfiguration {}
```

### 4. Execute Container Task

Use the `runInContainer` method to execute tasks in the Worker container:

```typescript
@Provide()
export class UserService {
  @Inject()
  piscinaService: piscina.PiscinaService;

  async heavyTask() {
    // Execute calculate task - multiply
    const result1 = await this.piscinaService.runInContainer('calculate', {
      a: 5,
      b: 6,
      operation: 'multiply',
    });
    console.log(result1); // 30

    // Execute calculate task - add
    const result2 = await this.piscinaService.runInContainer('calculate', {
      a: 10,
      b: 20,
      operation: 'add',
    });
    console.log(result2); // 30

    // Execute square task
    const result3 = await this.piscinaService.runInContainer('square', {
      value: 7,
    });
    console.log(result3); // 49
  }
}
```

## Cancel Task

You can use `AbortController` to cancel running tasks:

```typescript
@Provide()
export class UserService {
  @Inject()
  piscinaService: piscina.PiscinaService;

  async cancelableTask() {
    const abortController = new AbortController();

    // Cancel task after 3 seconds
    setTimeout(() => {
      abortController.abort();
    }, 3000);

    try {
      const result = await this.piscinaService.run(
        {
          handler: 'longRunning',
          payload: { duration: 10000 }, // 10 seconds task
        },
        {
          signal: abortController.signal, // Pass AbortSignal
        }
      );
    } catch (error) {
      console.error('Task cancelled:', error);
    }
  }
}
```

## Multiple Worker Pools

You can configure multiple Worker Pools, each executing different tasks:

```typescript
// src/config/config.default.ts
export default {
  piscina: {
    clients: {
      // Compute task pool
      compute: {
        workerFile: join(__dirname, '../worker/compute.worker'),
        maxThreads: 4,
      },
      // Image processing task pool
      image: {
        workerFile: join(__dirname, '../worker/image.worker'),
        maxThreads: 2,
      },
    },
  },
};
```

Use different Pools:

```typescript
@Provide()
export class UserService {
  @Inject()
  piscinaServiceFactory: piscina.PiscinaServiceFactory;

  async useDifferentPools() {
    // Use compute pool
    const computePool = this.piscinaServiceFactory.get('compute');
    const result1 = await computePool.run({
      handler: 'compute',
      payload: { value: 10 },
    });

    // Use image processing pool
    const imagePool = this.piscinaServiceFactory.get('image');
    const result2 = await imagePool.run({
      handler: 'process',
      payload: { imagePath: '/path/to/image.jpg' },
    });
  }
}
```

## Configuration

### Common Configuration

[Piscina](https://github.com/piscinajs/piscina) has very rich thread configurations.

```typescript
export default {
  piscina: {
    client: {
      workerFile: join(__dirname, '../worker/index'),
      minThreads: 1,           // Minimum number of threads
      maxThreads: 4,           // Maximum number of threads
      idleTimeout: 60000,      // Idle timeout (ms)
      maxQueue: 'auto',        // Maximum queue length
      concurrentTasksPerWorker: 1, // Concurrent tasks per Worker
    },
  },
};
```

### Multiple Pool Configuration

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

## Worker File Path Explanation

- Supports `.ts` and `.js` files, the framework will automatically find them.
- It is recommended to use paths without extensions, the framework searches in the order of `.js -> .ts -> .mjs -> .cjs`.
- The corresponding `.js` file will be automatically found after compilation in the production environment.

```typescript
// Recommended: without extension
workerFile: join(__dirname, '../worker/compute.worker')

// Also: explicitly specify extension
workerFile: join(__dirname, '../worker/compute.worker.js')
workerFile: join(__dirname, '../worker/compute.worker.ts')
```

## API Reference

### PiscinaService

#### run(task, options?)

Execute normal Worker tasks.

```typescript
await piscinaService.run(
  {
    handler: 'functionName',  // Function name exported in Worker file
    payload: { /* data */ },  // Arguments passed to the function
  },
  {
    signal: abortController.signal, // Optional: AbortSignal
    transferList: [],                // Optional: Transferable object list
  }
);
```

#### runInContainer(handler, payload?, options?)

Execute `@PiscinaTask` tasks in the Worker container.

```typescript
await piscinaService.runInContainer(
  'taskName',              // Argument of @PiscinaTask decorator
  { /* data */ },          // Arguments passed to execute method
  {
    signal: abortController.signal, // Optional: AbortSignal
  }
);
```

## Best Practices

### Applicable Scenarios

- CPU-intensive calculations (data processing, encryption/decryption, image processing)
- Long-running synchronous operations
- Scenarios where blocking the main thread needs to be avoided
- Scenarios where a large number of tasks need to be processed in parallel

### Choose the Right Mode

**Normal Worker Mode**:
- Suitable for simple pure function calculations
- No dependency injection needed
- Lower performance overhead

**Midway Container Mode**:
- Need to use dependency injection
- Need to use other services in the Worker
- Suitable for complex business logic

### Notes

1. **Data Transfer**: Data passed to the Worker will be serialized, functions, class instances, and other non-serializable objects are not supported.
2. **Thread Count Configuration**: Configure `maxThreads` reasonably based on the number of CPU cores to avoid overhead caused by excessive threads causing context switching.
3. **Memory Management**: Worker threads have independent memory spaces, pay attention to avoid memory leaks.
4. **Error Handling**: Errors in the Worker will be captured and passed back to the main thread, and need to be handled appropriately.
5. **Path Issues**: It is recommended to use absolute paths for Worker file paths (e.g., `join(__dirname, '../worker/xxx')`).

## FAQ

### How to transfer large amounts of data?

For large data (such as ArrayBuffer, Buffer), use `transferList` to avoid data copying:

```typescript
const buffer = new ArrayBuffer(1024 * 1024);
await piscinaService.run(
  { handler: 'process', payload: buffer },
  { transferList: [buffer] }
);
```
