import { IMidwayApplication, IMidwayContext, NextFunction as BaseNextFunction } from '@midwayjs/core';
import { JobId, Job } from 'bull';

export interface IProcessor {
  execute(data: any);
}

export interface IQueue<Job> {
  /**
   * @deprecated use addJobToQueue instead
   */
  runJob(data: Record<string, any>, options?: unknown): Promise<Job>;
  addJobToQueue(data: Record<string, any>, options?: unknown): Promise<Job>;
  getJob(name: string): Promise<Job>;
  getQueueName(): string;
}

export interface IQueueManager<Queue extends IQueue<Job>, Job> {
  addJobToQueue(queueName: string, jobData: any, options?: unknown): Promise<Job|undefined>;
  /**
   * @deprecated use addJobToQueue instead
   */
  runJob(queueName: string, jobData: any, options?: unknown): Promise<Job|undefined>;
  getJob(queueName: string, jobName: string): Promise<Job>;
  createQueue(queueName: string, queueOptions?: unknown): Queue;
  getQueue(queueName: string): Queue;
}

export interface Application extends IMidwayApplication<Context> {}
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  jobId: JobId;
  job: Job;
  from: new (...args) => IProcessor;
}
