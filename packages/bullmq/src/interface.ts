import { IMidwayApplication, IMidwayContext, NextFunction as BaseNextFunction } from '@midwayjs/core';
import { WorkerOptions, QueueOptions, Job, ConnectionOptions } from 'bullmq';

export interface IProcessor {
  execute(data: any, job: Job, token?: string): Promise<void>;
}

export interface Application extends IMidwayApplication<Context> { }
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  jobId: string;
  job: Job;
  from: new (...args) => IProcessor;
}

export interface BullMQConfig {
  defaultConnection?: ConnectionOptions;
  defaultPrefix?: string;
  defaultQueueOptions?: Partial<QueueOptions>;
  defaultWorkerOptions?: Partial<WorkerOptions>;
  clearRepeatJobWhenStart?: boolean;
  contextLoggerApplyLogger?: string;
  contextLoggerFormat?: (info: any) => string;
}
