import { IMidwayContext } from '@midwayjs/core';

export interface IQueue {
  execute(data): Promise<void>;
}

export interface Context extends IMidwayContext {

}
