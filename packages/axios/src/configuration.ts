import { Configuration } from '@midwayjs/core';
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
      // 解决循环引用
      if (config['axios']['clients'] || config['axios']['default']) {
        return config;
      }

      // 兼容older
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
