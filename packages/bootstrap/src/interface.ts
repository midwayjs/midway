import type { IMidwayLogger } from '@midwayjs/logger';
import { ClusterSettings } from 'cluster';
import { WorkerOptions } from 'worker_threads';

export interface ForkOptions {
  exec?: string;
  /**
   * worker num, default is `os.cpus().length`
   */
  count?: number;
  /**
   * refork when disconect and unexpected exit, default is `true`
   */
  refork?: boolean;
  /**
   * restart limit, default is `60`
   */
  limit?: number;

  duration?: number;

  logger?: IMidwayLogger | Console;
  /**
   * Some environments set to worker
   */
  env?: Record<string, string>;

  /**
   *  Worker init Timeout, default is 30s,
   */
  workerInitTimeout?: number;
}

export interface IForkManager<T> {
  start();
  close();
  hasWorker(workerId: string): boolean;
  getWorker(workerId: string): T;
  getWorkerIds(): string[];
  isWorkerDead(worker: T): boolean;
  isPrimary(): boolean;
}

export type ClusterOptions = ForkOptions & ClusterSettings & {
  sticky?: boolean;
  stickyLoadBalancingMethod?: 'random' | 'round-robin' | 'least-connection';
};

export type ThreadOptions = ForkOptions & WorkerOptions;
