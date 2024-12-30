import { Configuration, IMidwayContainer } from '@midwayjs/core';
import ConfigDefault from './config.default';
import { HttpServiceFactory } from './http-service.factory';

@Configuration({
  namespace: 'axios',
  importConfigs: [
    {
      default: ConfigDefault,
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
  public async onReady(container: IMidwayContainer): Promise<void> {
    await container.getAsync(HttpServiceFactory);
  }
}
