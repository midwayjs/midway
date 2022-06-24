import { Configuration } from '@midwayjs/decorator';
import { HttpServiceFactory } from './serviceManager';

@Configuration({
  namespace: 'axios',
  importConfigs: [
    {
      default: {
        axios: {},
      },
    },
  ],
})
export class AxiosConfiguration {
  async onReady(container) {
    await container.getAsync(HttpServiceFactory);
  }
}
