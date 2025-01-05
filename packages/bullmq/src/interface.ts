import { IMidwayApplication, IMidwayContext, NextFunction as BaseNextFunction } from '@midwayjs/core';
import { WorkerOptions, QueueOptions, Job, Worker } from 'bullmq';

export interface IProcessor {
  execute(data: any);
}

export interface IQueue<Job> {
  runJob(data: Record<string, any>, options?: unknown): Promise<Job>;
  getJob(name: string): Promise<Job>;
  getQueueName(): string;
}

export interface IQueueManager<Queue extends IQueue<Job>, Job> {
  runJob(queueName: string, jobData: any, options?: unknown): Promise<Job | undefined>;
  getJob(queueName: string, jobName: string): Promise<Job | undefined>;
  createQueue(queueName: string, queueOptions?: unknown): Queue;
  getQueue(queueName: string): Queue | undefined;
  getWorker(queueName: string): Worker | undefined;
}

export interface Application extends IMidwayApplication<Context> { }
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  jobId: string;
  job: Job;
  from: new (...args) => IProcessor;
}

export type IWorkerOptions = Omit<WorkerOptions, 'connection' | 'prefix'>
export type IQueueOptions = Omit<QueueOptions, 'connection' | 'prefix'>

