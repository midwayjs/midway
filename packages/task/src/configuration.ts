import { App, Configuration, Inject } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';

import { TaskFramework } from './framework';

@Configuration({
  namespace: 'task',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class TaskConfiguration implements ILifeCycle {
  @App()
  app;

  @Inject()
  taskFramework: TaskFramework;

  async onServerReady(): Promise<void> {
    await this.taskFramework.run();
  }
}
