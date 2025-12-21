import { Configuration } from '@midwayjs/core';

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
                return `${info.timestamp} ${info.LEVEL} ${info.pid} [${
                  from?.name || from
                }] ${info.message}`;
              },
            },
          },
        },
      },
    },
  ],
})
export class BackgroundTaskConfiguration {
  async onReady() {}
}
