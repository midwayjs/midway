import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { PiscinaServiceFactory } from './manager';

@Configuration({
  namespace: 'piscina',
  importConfigs: [
    {
      default: {
        piscina: {},
        midwayLogger: {
          clients: {
            piscinaWorkerLogger: {
              fileLogName: 'midway-piscina-worker.log',
            },
          },
        },
      },
    },
  ],
})
export class PiscinaConfiguration implements ILifeCycle {
  async onReady(container: IMidwayContainer) {
    await container.getAsync(PiscinaServiceFactory);
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    const factory = await container.getAsync(PiscinaServiceFactory);
    await factory.stop();
  }
}
