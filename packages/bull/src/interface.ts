import { IMidwayApplication, IMidwayContext, NextFunction as BaseNextFunction } from '@midwayjs/core';
import * as Bull from 'bull';
import { Job, JobId } from 'bull';

export interface IQueue {
  execute(data: any, job: Bull.Job): Promise<void>;
  /**
   * An error occurred. error contains the triggering error.
   * @param error
   * @constructor
   */
  OnQueueError(error: Error);

  /**
   * A Job is waiting to be processed as soon as a worker is idling. jobId contains the id for the job that has entered this state.
   * @param jobId
   * @constructor
   */
  OnQueueWaiting(jobId: number | string);

  /**
   * Job job has started.
   * @param job
   * @constructor
   */
  OnQueueActive(job: Job) ;

  /**
   * Job job has been marked as stalled.
   * This is useful for debugging job workers that crash or pause the event loop.
   * @param job
   * @constructor
   */
  OnQueueStalled(job: Job);

  /**
   * Job job's progress was updated to value progress.
   * @param job
   * @param progress
   * @constructor
   */
  OnQueueProgress(job: Job, progress: number);

  /**
   * Job job successfully completed with a result result.
   * @param job
   * @param result
   * @constructor
   */
  OnQueueCompleted(job: Job, result: any);

  /**
   * Job job failed with reason err.
   * @param job
   * @param err
   * @constructor
   */
  OnQueueFailed(job: Job, err: Error);

  /**
   * The queue has been paused.
   * @constructor
   */
  OnQueuePaused();

  /**
   * The queue has been resumed.
   * @param job
   * @constructor
   */
  OnQueueResumed(job: Job);

  /**
   * Old jobs have been cleaned from the queue.
   * jobs is an array of cleaned jobs, and type is the type of jobs cleaned.
   * @param jobs
   * @param type
   * @constructor
   */
  OnQueueCleaned(jobs: Job[], type: string);

  /**
   * Emitted whenever the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed).
   * @constructor
   */
  OnQueueDrained();

  /**
   * Job job was successfully removed.
   * @constructor
   */
  OnQueueRemoved();
}

export interface Application extends IMidwayApplication<Context> {}
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  jobId: JobId;
  triggerName: string;
  triggerUUID: string;
}
