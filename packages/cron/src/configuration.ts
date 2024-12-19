import {
  Configuration,
  Init,
  Inject,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { CronFramework } from './framework';
import { CRON_JOB_KEY } from './constants';
import { JobNameOrClz } from './interface';
@Configuration({
  namespace: 'cron',
  importConfigs: [
    {
      default: {
        cron: {
          defaultCronJobOptions: {},
        },
        midwayLogger: {
          clients: {
            cronLogger: {
              fileLogName: 'midway-cron.log',
              contextFormat: info => {
                const { from } = info.ctx;
                return `${info.timestamp} ${info.LEVEL} ${info.pid} [${from.name}] ${info.message}`;
              },
            },
          },
        },
      },
    },
  ],
})
export class CronConfiguration {
  @Inject()
  framework: CronFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      CRON_JOB_KEY,
      (
        propertyName,
        meta: {
          jobName: JobNameOrClz;
        }
      ) => {
        return this.framework.getJob(meta.jobName);
      }
    );
  }

  async onReady() {
    this.framework.loadConfig();
  }
}
