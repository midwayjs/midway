import {
  createCustomPropertyDecorator,
  Provide,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { CRON_JOB_KEY } from './constants';
import { CronJobOptions, IJob } from './interface';

export function Job(jobOptions?: CronJobOptions): ClassDecorator;
export function Job(
  jobName: string,
  jobOptions?: CronJobOptions
): ClassDecorator;
export function Job(jobName: any, jobOptions?: CronJobOptions): ClassDecorator {
  return function (target: any) {
    if (typeof jobName !== 'string') {
      jobOptions = jobName;
      jobName = undefined;
    }
    saveModule(CRON_JOB_KEY, target);
    saveClassMetadata(
      CRON_JOB_KEY,
      {
        jobOptions,
        jobName,
      },
      target
    );
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function InjectJob(
  jobName: string | (new (...args) => IJob)
): PropertyDecorator {
  return createCustomPropertyDecorator(CRON_JOB_KEY, {
    jobName,
  });
}
