import { IMidwayApplication, IMidwayContext, NextFunction as BaseNextFunction } from '@midwayjs/core';
import { CronJob, CronJobParameters } from 'cron';

export { CronJob } from 'cron';

export type CronJobOptions = Omit<CronJobParameters, 'onTick'|'onComplete'>;
export interface CronOptions {
  defaultCronJobOptions?: CronJobOptions;
}

export interface IJob {
  /**
   * The function to fire at the specified time. If an onComplete callback was provided, onTick will receive it as an argument. onTick may call onComplete when it has finished its work.
   */
  onTick(data: any);

  /**
   * A function that will fire when the job is stopped with job.stop(), and may also be called by onTick at the end of each run.
   */
  onComplete?();
}

export type JobNameOrClz = string | (new (...args) => IJob);

export interface Application extends IMidwayApplication<Context> {}
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  job: CronJob;
}
