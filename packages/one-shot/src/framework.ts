import {
  BaseFramework,
  Framework,
  IMidwayBootstrapOptions,
  MidwayCommonError,
  MidwayTraceService,
} from '@midwayjs/core';
import {
  IMidwayOneShotApplication,
  IMidwayOneShotContext,
  OneShotConfigOptions,
  OneShotRunner,
} from './interface';

/**
 * Framework for one-shot scripts.
 */
@Framework()
export class MidwayOneShotFramework extends BaseFramework<
  IMidwayOneShotApplication,
  IMidwayOneShotContext,
  OneShotConfigOptions
> {
  protected frameworkLoggerName = 'oneShotLogger';

  configure(): OneShotConfigOptions {
    return this.configService.getConfiguration('oneShot');
  }

  async applicationInitialize(_options: IMidwayBootstrapOptions) {
    void _options;
    this.app = {} as IMidwayOneShotApplication;
  }

  public async run(): Promise<void> {
    // one-shot framework runs on demand
  }

  /**
   * Execute a one-shot runner class once.
   */
  public async runScript<T = unknown, R = unknown>(
    Runner: new (...args: unknown[]) => OneShotRunner<T, R>,
    payload?: T,
    ctxData: Partial<IMidwayOneShotContext> = {}
  ): Promise<R> {
    const ctx = this.app.createAnonymousContext({
      ...ctxData,
      payload,
    });

    const traceService = this.applicationContext.get(MidwayTraceService);
    const traceMetaResolver = this.configurationOptions?.tracing?.meta;

    return (await traceService.runWithEntrySpan(
      `oneshot ${Runner.name || 'runner'}`,
      {
        attributes: {
          'midway.protocol': 'one-shot',
          'midway.oneshot.runner': Runner.name || 'runner',
        },
        meta: traceMetaResolver,
        metaArgs: {
          ctx,
          request: payload,
          custom: {
            runner: Runner.name || 'runner',
          },
        },
      },
      async () => {
        const fn = await this.applyMiddleware(async ctx => {
          const instance = (await ctx.requestContext.getAsync(
            Runner
          )) as OneShotRunner<T, R>;
          if (!instance?.run) {
            throw new MidwayCommonError(
              'One-shot runner must implement run().'
            );
          }
          return await instance.run(payload, ctx);
        });
        return await fn(ctx);
      }
    )) as R;
  }
}
