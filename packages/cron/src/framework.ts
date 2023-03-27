import {
  BaseFramework,
  extend,
  Framework,
  getClassMetadata,
  getProviderUUId,
  IMidwayBootstrapOptions,
  listModule,
  MidwayInvokeForbiddenError,
  Utils,
} from '@midwayjs/core';
import {
  Application,
  Context,
  CronOptions,
  IJob,
  JobNameOrClz,
} from './interface';
import { CronJob, CronJobParameters } from 'cron';
import { CRON_JOB_KEY } from './constants';

@Framework()
export class CronFramework extends BaseFramework<Application, Context, any> {
  private defaultCronJobConfig: CronOptions;
  private jobs: Map<string, CronJob> = new Map();

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  public loadConfig() {
    this.defaultCronJobConfig = this.configService.getConfiguration(
      'cron.defaultCronJobOptions'
    );
  }

  configure() {
    return this.configService.getConfiguration('cron');
  }

  getFrameworkName(): string {
    return 'cron';
  }

  async run() {
    const jobModules = listModule(CRON_JOB_KEY);
    for (const mod of jobModules) {
      this.addJob(mod);
    }
  }

  protected async beforeStop() {
    // loop queueMap and stop all queue
    for (const name of this.jobs.keys()) {
      await this.deleteJob(name);
    }
  }

  public addJob(
    name: JobNameOrClz,
    jobOptions: Partial<CronJobParameters> = {}
  ): CronJob {
    let jobName: string;
    if (typeof name === 'string') {
      jobName = name;
    } else {
      const options = getClassMetadata(CRON_JOB_KEY, name) as {
        jobOptions?: CronJobParameters;
        name?: string;
      };
      jobName = options.name || getProviderUUId(name);
      jobOptions = extend(
        true,
        {},
        this.defaultCronJobConfig,
        options.jobOptions,
        jobOptions
      );
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      jobOptions.onTick = function (this: CronJob) {
        (async () => {
          const ctx = self.app.createAnonymousContext({
            job: this,
          });

          ctx.logger.info(`start job ${name.name}`);

          const isPassed = await self.app
            .getFramework()
            .runGuard(ctx, name, 'onTick');
          if (!isPassed) {
            throw new MidwayInvokeForbiddenError('onTick', name);
          }

          const service = await ctx.requestContext.getAsync<IJob>(name);
          const fn = await self.applyMiddleware(async ctx => {
            return await Utils.toAsyncFunction(service.onTick.bind(service))();
          });

          try {
            const result = await Promise.resolve(await fn(ctx));
            ctx.logger.info(`complete job ${name.name}`);
            await service.onComplete?.(result);
            return result;
          } catch (err) {
            ctx.logger.error(err);
          }
        })().catch(err => {
          self.logger.error(`error in job from ${name.name}: ${err}`);
        });
      };
    }
    const job = new CronJob(jobOptions as CronJobParameters);
    this.jobs.set(jobName, job);
    return job;
  }

  public getJob(name: JobNameOrClz) {
    return this.jobs.get(this.getJobName(name));
  }

  public async deleteJob(name: JobNameOrClz) {
    const jobName = this.getJobName(name);
    try {
      this.jobs.get(jobName).stop();
      this.jobs.delete(jobName);
    } catch (err) {
      this.logger.error(`error in trying to stop job: ${jobName}: ${err}`);
    }
  }

  private getJobName(name: JobNameOrClz) {
    if (typeof name === 'string') {
      return name;
    } else {
      const options = getClassMetadata(CRON_JOB_KEY, name) as {
        jobOptions?: CronJobParameters;
        name?: string;
      };
      return options.name || getProviderUUId(name);
    }
  }
}
