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
  importConfigFilter: config => {
    if (config['axios']) {
      if (!config['axios']['clients'] || !config['axios']['client']) {
        config['axios'] = {
          default: {},
          clients: {
            default: config['axios'],
          },
        };
      }
    }
    return config;
  },
})
export class AxiosConfiguration {
  async onReady(container) {
    await container.getAsync(HttpServiceFactory);
  }
}
