import { BaseFramework, Framework, DecoratorManager, IMidwayBootstrapOptions, MidwayInvokeForbiddenError, Utils, MetadataManager } from '@midwayjs/core';
import { Application, Context, IBackgroundTask, TaskNameOrClz } from './interface';
import { BACKGROUND_TASK_KEY } from './constants';

@Framework()
export class BackgroundTaskFramework extends BaseFramework<Application, Context, any> {
  private tasks: Map<string, Promise<any>> = new Map();
  protected frameworkLoggerName = 'backgroundTaskLogger';

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
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
      const options = MetadataManager.getOwnMetadata(BACKGROUND_TASK_KEY, name) as { taskName?: string };
      taskName = options.taskName || DecoratorManager.getProviderUUId(name);
    }
    const self = this;
    const p = (async () => {
      const ctx = self.app.createAnonymousContext({ from: typeof name === 'string' ? name : name });
      ctx.logger.info(`start task ${typeof name === 'string' ? name : name.name}`);
      const isPassed = await self.app.getFramework().runGuard(ctx, typeof name === 'string' ? null : name, 'execute');
      if (!isPassed && typeof name !== 'string') {
        throw new MidwayInvokeForbiddenError('execute', name);
      }
      const service = typeof name === 'string' ? await ctx.requestContext.getAsync<IBackgroundTask>(DecoratorManager.getProviderUUId(name as any)) : await ctx.requestContext.getAsync<IBackgroundTask>(name as any);
      const fn = await self.applyMiddleware(async ctx => {
        return await Utils.toAsyncFunction(service.execute.bind(service))();
      });
      try {
        const result = await Promise.resolve(await fn(ctx));
        ctx.logger.info(`complete task ${typeof name === 'string' ? name : name.name}`);
        await service.onComplete?.(result);
        return result;
      } catch (err) {
        ctx.logger.error(err);
        throw err;
      }
    })().catch(err => {
      self.logger.error(`error in task from ${typeof name === 'string' ? name : name.name}: ${err.stack}`);
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
    const self = this;
    const p = (async () => {
      const ctx = self.app.createAnonymousContext({ from: name, app: self.app });
      ctx.logger.info(`start task ${name}`);
      const fn = await self.applyMiddleware(async ctx => {
        return await Utils.toAsyncFunction(executor.bind(null))(
          ctx
        );
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

  public getTask(name: TaskNameOrClz) {
    return this.tasks.get(this.getTaskName(name));
  }

  private getTaskName(name: TaskNameOrClz) {
    if (typeof name === 'string') {
      return name;
    } else {
      const options = MetadataManager.getOwnMetadata(BACKGROUND_TASK_KEY, name) as { taskName?: string };
      return options.taskName || DecoratorManager.getProviderUUId(name);
    }
  }
}
