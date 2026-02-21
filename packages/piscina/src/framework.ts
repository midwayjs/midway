import {
  BaseFramework,
  Framework,
  IMidwayBootstrapOptions,
  DecoratorManager,
  MetadataManager,
  MidwayCommonError,
  MidwayTraceService,
} from '@midwayjs/core';
import { Application, Context } from './interface';
import { PISCINA_TASK_KEY } from './constants';

/**
 * Piscina Worker Framework
 * 用于在 Worker 线程中启动 Midway 应用
 */
@Framework()
export class PiscinaWorkerFramework extends BaseFramework<
  Application,
  Context,
  any
> {
  protected frameworkLoggerName = 'piscinaWorkerLogger';
  private taskHandlers: Map<string, any> = new Map();

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  configure() {
    return {};
  }

  getFrameworkName(): string {
    return 'piscinaWorker';
  }

  async run() {
    // 加载所有标记了 @PiscinaTask 的任务类
    const taskModules = DecoratorManager.listModule(PISCINA_TASK_KEY);

    for (const module of taskModules) {
      const metadata = MetadataManager.getMetadata(PISCINA_TASK_KEY, module);
      if (metadata && metadata.handler) {
        this.taskHandlers.set(metadata.handler, module);
      }
    }
  }

  /**
   * 根据 handler 名称执行任务
   */
  async executeTask<T = any, R = any>(
    handler: string,
    payload?: T
  ): Promise<R> {
    const TaskClass = this.taskHandlers.get(handler);

    if (!TaskClass) {
      throw new MidwayCommonError(
        `Task handler "${handler}" not found. Did you forget to use @PiscinaTask('${handler}') decorator?`
      );
    }

    const ctx = this.app.createAnonymousContext();
    const traceService = this.applicationContext.get(MidwayTraceService);
    const traceMetaResolver = this.configurationOptions?.tracing?.meta;
    return await traceService.runWithEntrySpan(
      `piscina ${handler}`,
      {
        attributes: {
          'midway.protocol': 'piscina',
          'midway.piscina.handler': handler,
        },
        meta: traceMetaResolver,
        metaArgs: {
          ctx,
          request: payload,
          custom: {
            handler,
          },
        },
      },
      async () => {
        const taskInstance = await ctx.requestContext.getAsync<any>(TaskClass);

        if (!taskInstance || typeof taskInstance.execute !== 'function') {
          throw new MidwayCommonError(
            `Task "${handler}" must implement execute method`
          );
        }

        return await taskInstance.execute(payload);
      }
    );
  }

  /**
   * 获取所有已注册的 handler
   */
  getTaskHandlers(): string[] {
    return Array.from(this.taskHandlers.keys());
  }
}
