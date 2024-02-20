import { Configuration, IMidwayContainer, Inject } from '@midwayjs/core';
import { MidwayMQTTFramework } from './framework';
import { MqttProducerFactory } from './service';

@Configuration({
  namespace: 'mqtt',
  importConfigs: [
    {
      default: {
        mqtt: {
          pub: {},
          sub: {},
          contextLoggerApplyLogger: 'mqttLogger',
        },
        midwayLogger: {
          clients: {
            mqttLogger: {
              fileLogName: 'midway-mqtt.log',
            },
          },
        },
      },
    },
  ],
})
export class MQTTConfiguration {
  @Inject()
  framework: MidwayMQTTFramework;
  factory: MqttProducerFactory;
  async onReady(container: IMidwayContainer) {
    this.factory = await container.getAsync(MqttProducerFactory);
  }

  async onStop() {
    await this.factory.stop();
  }
}
