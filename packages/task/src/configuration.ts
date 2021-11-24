import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'task',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class TaskConfiguration implements ILifeCycle {}
