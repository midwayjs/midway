import {
  BaseFramework,
  Framework,
  DecoratorManager,
  IMidwayBootstrapOptions,
  Utils,
  MetadataManager,
} from '@midwayjs/core';
import { Piscina } from 'piscina';
import {
  Application,
  Context,
  IBackgroundTask,
  TaskNameOrClz,
} from './interface';
import { BACKGROUND_TASK_KEY } from './constants';

@Framework()
export class BackgroundTaskFramework extends BaseFramework<
  Application,
  Context,
  any
> {
  private tasks: Map<string, Promise<any>> = new Map();
  protected frameworkLoggerName = 'backgroundTaskLogger';
  private pool?: Piscina;

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
    const cfg = this.configure();
    if (cfg?.piscina) {
      this.pool = new Piscina(cfg.piscina);
    } else {
      this.pool = new Piscina({});
    }
  }

  configure() {
    return this.configService.getConfiguration('backgroundTask');
  }

  getFrameworkName(): string {
    return 'backgroundTask';
  }

  async run() {
    const taskModules = DecoratorManager.listModule(BACKGROUND_TASK_KEY);
    for (const mod of taskModules) {
      this.addTask(mod);
    }
  }

  public addTask(name: TaskNameOrClz): Promise<any> {
    let taskName: string;
    if (typeof name === 'string') {
      taskName = name;
    } else {
      const options = MetadataManager.getOwnMetadata(
        BACKGROUND_TASK_KEY,
        name
      ) as { taskName?: string; worker?: { filename: string; name?: string } };
      taskName = options.taskName || DecoratorManager.getProviderUUId(name);
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const p = (async () => {
      const ctx = self.app.createAnonymousContext({
        from: typeof name === 'string' ? name : name,
      });
      ctx.logger.info(
        `start task ${typeof name === 'string' ? name : name.name}`
      );
      // Try to run via Piscina if worker metadata exists
      const options =
        typeof name === 'string'
          ? undefined
          : (MetadataManager.getOwnMetadata(
              BACKGROUND_TASK_KEY,
              name
            ) as { taskName?: string; worker?: { filename: string; name?: string } });
      if (options?.worker && this.pool) {
        try {
          const result = await this.pool.run(
            {},
            { filename: options.worker.filename, name: options.worker.name }
          );
          ctx.logger.info(
            `complete task ${typeof name === 'string' ? name : name.name}`
          );
          if (
            typeof name !== 'string' &&
            typeof (name as any)?.prototype?.onComplete === 'function'
          ) {
            const service = await ctx.requestContext.getAsync<IBackgroundTask>(
              name as any
            );
            await service.onComplete?.(result);
          }
          return result;
        } catch (err) {
          ctx.logger.error(err);
          throw err;
        }
      } else {
        throw new Error(
          `worker is required for task ${typeof name === 'string' ? name : name.name}`
        );
      }
    })().catch(err => {
      self.logger.error(
        `error in task from ${typeof name === 'string' ? name : name.name}: ${
          err.stack
        }`
      );
      throw err;
    });
    this.tasks.set(taskName, p);
    return p;
  }

  public createTask(
    name: string,
    executor: (ctx: Context) => any,
    onComplete?: (result: any) => any
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const p = (async () => {
      const ctx = self.app.createAnonymousContext({
        from: name,
        app: self.app,
      });
      ctx.logger.info(`start task ${name}`);
      const fn = await self.applyMiddleware(async ctx => {
        return await Utils.toAsyncFunction(executor.bind(null))(ctx);
      });
      try {
        const result = await Promise.resolve(await fn(ctx));
        ctx.logger.info(`complete task ${name}`);
        await onComplete?.(result);
        return result;
      } catch (err) {
        ctx.logger.error(err);
        throw err;
      }
    })().catch(err => {
      self.logger.error(`error in task from ${name}: ${err.stack}`);
      throw err;
    });
    this.tasks.set(name, p);
    return p;
  }

  public createWorkerTask(
    name: string,
    filename: string,
    handler?: string,
    payload?: any,
    onComplete?: (result: any) => any
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const p = (async () => {
      const ctx = self.app.createAnonymousContext({
        from: name,
        app: self.app,
      });
      ctx.logger.info(`start task ${name}`);
      try {
        const result = await this.pool.run(payload ?? {}, {
          filename,
          name: handler,
        });
        ctx.logger.info(`complete task ${name}`);
        await onComplete?.(result);
        return result;
      } catch (err) {
        ctx.logger.error(err);
        throw err;
      }
    })().catch(err => {
      self.logger.error(`error in task from ${name}: ${err.stack}`);
      throw err;
    });
    this.tasks.set(name, p);
    return p;
  }

  public getTask(name: TaskNameOrClz) {
    return this.tasks.get(this.getTaskName(name));
  }

  private getTaskName(name: TaskNameOrClz) {
    if (typeof name === 'string') {
      return name;
    } else {
      const options = MetadataManager.getOwnMetadata(
        BACKGROUND_TASK_KEY,
        name
      ) as { taskName?: string };
      return options.taskName || DecoratorManager.getProviderUUId(name);
    }
  }
}
