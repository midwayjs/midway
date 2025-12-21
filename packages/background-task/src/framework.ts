import {
  BaseFramework,
  Framework,
  IMidwayBootstrapOptions,
  Utils,
} from '@midwayjs/core';
import { Piscina } from 'piscina';
import { join } from 'path';
import {
  Application,
  Context,
  IBackgroundTask,
  TaskStrategy,
  BackgroundTaskConfig,
  RunInBackgroundOptions,
  RunInWorkerThreadOptions,
  TaskExecutor,
  WorkerMessage,
} from './interface';

interface TaskEntry {
  promise: Promise<any>;
  strategy: TaskStrategy;
  status: 'pending' | 'running' | 'completed' | 'failed';
  taskName: string;
}

@Framework()
export class BackgroundTaskFramework extends BaseFramework<
  Application,
  Context,
  any
> {
  private tasks: Map<string, TaskEntry> = new Map();
  protected frameworkLoggerName = 'backgroundTaskLogger';
  private pool?: Piscina;
  private taskCounter = 0;

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
    const cfg = this.configure();

    // 初始化 piscina 线程池（懒加载，仅在需要时创建）
    if (cfg?.piscina) {
      this.pool = new Piscina({
        ...cfg.piscina,
        filename: join(__dirname, 'worker-bootstrap.js'),
      });
    }
  }

  /**
   * 获取或创建线程池
   */
  private getOrCreatePool(): Piscina {
    if (!this.pool) {
      this.pool = new Piscina({
        filename: join(__dirname, 'worker-bootstrap.js'),
      });
    }
    return this.pool;
  }

  configure(): BackgroundTaskConfig | undefined {
    return this.configService.getConfiguration('backgroundTask');
  }

  getFrameworkName(): string {
    return 'backgroundTask';
  }

  async run() {
    // 框架启动时不自动执行任务
    // 用户需要显式调用 runInBackground 或 runInWorkerThread
  }

  /**
   * 在后台运行任务（主线程，PROMISE 模式）
   *
   * @example
   * // 使用函数
   * await framework.runInBackground(
   *   async (payload) => payload.value * 2,
   *   { payload: { value: 10 } }
   * );
   *
   * @example
   * // 使用类
   * await framework.runInBackground(MyTask, {
   *   payload: { value: 10 },
   *   onComplete: (result) => console.log(result),
   * });
   */
  public runInBackground<T = any, R = any>(
    executor: TaskExecutor<T, R>,
    options?: RunInBackgroundOptions<T>
  ): Promise<R> {
    const { payload, onComplete, onError, taskName } = options || {};

    // 生成任务名称
    const name = taskName || this.generateTaskName(executor);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const p = (async () => {
      const ctx = self.app.createAnonymousContext({
        from: name,
      });

      ctx.logger.info(`[promise] start task: ${name}`);
      const startTime = Date.now();

      try {
        const result = await self.executeInMainThread(executor, payload, ctx);

        const duration = Date.now() - startTime;
        ctx.logger.info(`[promise] complete task: ${name} (${duration}ms)`);

        // 调用 onComplete 回调（在主线程）
        await onComplete?.(result);

        self.updateTaskStatus(name, 'completed');
        return result;
      } catch (err) {
        const duration = Date.now() - startTime;
        ctx.logger.error(`[promise] task failed: ${name} (${duration}ms)`, err);

        // 调用 onError 回调（在主线程）
        await onError?.(err as Error);

        self.updateTaskStatus(name, 'failed');
        throw err;
      }
    })();

    this.tasks.set(name, {
      promise: p,
      strategy: TaskStrategy.PROMISE,
      status: 'running',
      taskName: name,
    });

    return p;
  }

  /**
   * 在 Worker 线程中运行任务（THREAD 模式）
   *
   * @param workerFile Worker 文件的绝对路径
   * @param options 配置选项
   *
   * @example
   * await framework.runInWorkerThread('/path/to/worker.js', {
   *   handler: 'compute',
   *   payload: { value: 10 },
   *   onComplete: (result) => console.log(result),
   * });
   */
  public runInWorkerThread<T = any, R = any>(
    workerFile: string,
    options?: RunInWorkerThreadOptions<T>
  ): Promise<R> {
    const { handler, payload, onComplete, onError, taskName } = options || {};

    // 生成任务名称
    const name = taskName || `worker:${this.taskCounter++}`;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const p = (async () => {
      const ctx = self.app.createAnonymousContext({
        from: name,
      });

      ctx.logger.info(`[thread] start task: ${name}`);
      const startTime = Date.now();

      try {
        const pool = self.getOrCreatePool();

        const message: WorkerMessage = {
          workerFile,
          handler,
          payload,
        };

        const result = await pool.run(message);

        const duration = Date.now() - startTime;
        ctx.logger.info(`[thread] complete task: ${name} (${duration}ms)`);

        await onComplete?.(result);
        self.updateTaskStatus(name, 'completed');
        return result;
      } catch (err) {
        const duration = Date.now() - startTime;
        ctx.logger.error(`[thread] task failed: ${name} (${duration}ms)`, err);

        await onError?.(err as Error);
        self.updateTaskStatus(name, 'failed');
        throw err;
      }
    })();

    this.tasks.set(name, {
      promise: p,
      strategy: TaskStrategy.THREAD,
      status: 'running',
      taskName: name,
    });

    return p;
  }

  /**
   * Promise 模式：在主线程中执行
   */
  private async executeInMainThread<T, R>(
    executor: TaskExecutor<T, R>,
    payload: T | undefined,
    ctx: Context
  ): Promise<R> {
    if (typeof executor === 'function' && !this.isClass(executor)) {
      // 函数模式：直接调用
      const fn = executor as (payload?: T) => Promise<R> | R;
      return await Utils.toAsyncFunction(fn)(payload);
    } else {
      // 类模式：从容器获取实例并执行
      const TaskClass = executor as new (...args: any[]) => IBackgroundTask<T, R>;
      const service = await ctx.requestContext.getAsync<IBackgroundTask<T, R>>(TaskClass);
      return await Utils.toAsyncFunction(service.execute.bind(service))(payload);
    }
  }

  /**
   * 判断是否为类（而非普通函数）
   */
  private isClass(fn: any): boolean {
    return (
      typeof fn === 'function' &&
      /^class\s/.test(Function.prototype.toString.call(fn))
    );
  }

  /**
   * 生成任务名称
   */
  private generateTaskName(executor: TaskExecutor): string {
    if (typeof executor === 'function') {
      if (this.isClass(executor)) {
        return `${executor.name}:${this.taskCounter++}`;
      } else {
        return `anonymous:${this.taskCounter++}`;
      }
    }
    return `task:${this.taskCounter++}`;
  }

  private updateTaskStatus(name: string, status: 'completed' | 'failed') {
    const entry = this.tasks.get(name);
    if (entry) {
      entry.status = status;
    }
  }

  /**
   * 获取任务 Promise
   */
  public getTask(name: string): Promise<any> | undefined {
    return this.tasks.get(name)?.promise;
  }

  /**
   * 获取任务状态
   */
  public getTaskStatus(name: string): TaskEntry | undefined {
    return this.tasks.get(name);
  }

  /**
   * 获取所有任务
   */
  public getAllTasks(): Map<string, TaskEntry> {
    return this.tasks;
  }

  async stop() {
    // 关闭线程池
    if (this.pool) {
      await this.pool.destroy();
    }
  }
}
