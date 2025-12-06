import { IMidwayApplication, IMidwayContext, NextFunction as BaseNextFunction } from '@midwayjs/core';

export interface BackgroundTaskOptions {}

export interface IBackgroundTask {
  execute(): any;
  onComplete?(result: any): any;
}

export type TaskNameOrClz = string | (new (...args) => IBackgroundTask);

export interface Application extends IMidwayApplication<Context> {}
export type NextFunction = BaseNextFunction;

export interface Context extends IMidwayContext {
  from: any;
}
