import { Configuration, Init, Inject, MidwayDecoratorService } from '@midwayjs/core';
import { BackgroundTaskFramework } from './framework';
import { BACKGROUND_TASK_KEY } from './constants';
import { TaskNameOrClz } from './interface';

@Configuration({
  namespace: 'backgroundTask',
  importConfigs: [
    {
      default: {
        midwayLogger: {
          clients: {
            backgroundTaskLogger: {
              fileLogName: 'midway-background-task.log',
              contextFormat: info => {
                const { from } = info.ctx;
                return `${info.timestamp} ${info.LEVEL} ${info.pid} [${from?.name || from}] ${info.message}`;
              },
            },
          },
        },
      },
    },
  ],
})
export class BackgroundTaskConfiguration {
  @Inject()
  framework: BackgroundTaskFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      BACKGROUND_TASK_KEY,
      (
        propertyName,
        meta: {
          taskName: TaskNameOrClz;
        }
      ) => {
        return this.framework.getTask(meta.taskName);
      }
    );
  }

  async onReady() {}
}
