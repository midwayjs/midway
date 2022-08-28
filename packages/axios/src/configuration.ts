import { MidwayConfigMissingError } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import { HttpServiceFactory } from './serviceManager';

@Configuration({
  namespace: 'axios',
  importConfigs: [
    {
      default: {
        axios: {
          default: {},
        },
      },
    },
  ],
  importConfigFilter: config => {
    if (config['axios']) {
      // 检查意外client书写错误
      if (!config['axios']['clients'] && config['axios']['client']) {
        throw new MidwayConfigMissingError(
          'using clients replace client filed in axios config.'
        );
      }

      // 不存在clients字段时，使用axios配置中的default字段作为clients：{default: {...}}
      if (!config['axios']['clients']) {
        config['axios'] = {
          default: config['axios']['default'],
          clients: {
            default: config['axios']['default'],
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
