import { Configuration, Inject, ILifeCycle } from '@midwayjs/core';
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
  @Inject()
  framework: TaskFramework;

  async onServerReady() {
    await this.framework.loadTask();
    await this.framework.loadLocalTask();
    await this.framework.loadQueue();
  }
}
