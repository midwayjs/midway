import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import * as Bull from 'bull';

export interface IQueue {
  execute(data: any, job: Bull.Job): Promise<void>;
}

export interface Application extends IMidwayApplication<Context> {}

export interface Context extends IMidwayContext {
  taskInfo: {
    type: string;
    id: string;
    trigger: string;
  }
}
