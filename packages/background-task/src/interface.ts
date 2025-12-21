import {
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';

/**
 * 任务执行策略
 */
export enum TaskStrategy {
  /**
   * Promise 模式：在当前进程主线程中执行
   * 适合 I/O 密集型、快速任务
   */
  PROMISE = 'promise',

  /**
   * 独立线程模式：使用 Worker Thread (Piscina) 执行
   * 需要指定 worker 文件路径，适合 CPU 密集型计算
   */
  THREAD = 'thread',
}

/**
 * 后台任务配置
 */
export interface BackgroundTaskConfig {
  /**
   * piscina 配置（用于 THREAD 模式）
   */
  piscina?: Record<string, any>;
}

/**
 * 后台任务接口
 */
export interface IBackgroundTask<T = any, R = any> {
  /**
   * 任务执行方法
   * @param payload 任务参数
   */
  execute(payload?: T): Promise<R> | R;
}

/**
 * runInBackground 选项（PROMISE 模式）
 */
export interface RunInBackgroundOptions<T = any> {
  /**
   * 任务参数
   */
  payload?: T;

  /**
   * 任务完成回调（在主线程中执行）
   */
  onComplete?: (result: any) => any;

  /**
   * 任务失败回调（在主线程中执行）
   */
  onError?: (error: Error) => any;

  /**
   * 任务名称（用于日志和追踪）
   */
  taskName?: string;
}

/**
 * runInWorkerThread 选项（THREAD 模式）
 */
export interface RunInWorkerThreadOptions<T = any> {
  /**
   * Worker 文件中的导出函数名
   */
  handler?: string;

  /**
   * 任务参数
   */
  payload?: T;

  /**
   * 任务完成回调（在主线程中执行）
   */
  onComplete?: (result: any) => any;

  /**
   * 任务失败回调（在主线程中执行）
   */
  onError?: (error: Error) => any;

  /**
   * 任务名称（用于日志和追踪）
   */
  taskName?: string;
}

/**
 * 任务执行器类型
 * 可以是实现 IBackgroundTask 的类，或者是一个函数
 */
export type TaskExecutor<T = any, R = any> =
  | (new (...args: any[]) => IBackgroundTask<T, R>)
  | ((payload?: T) => Promise<R> | R);

export type TaskNameOrClz = string | (new (...args) => IBackgroundTask);

export interface Application extends IMidwayApplication<Context> {}
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  from: any;
}

/**
 * Worker 消息格式
 */
export interface WorkerMessage {
  /**
   * Worker 文件路径
   */
  workerFile: string;

  /**
   * 导出的处理函数名
   */
  handler?: string;

  /**
   * 任务参数
   */
  payload?: any;
}
