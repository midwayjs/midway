import { IMidwayContainer } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  namespace: 'rabbitmq',
  importConfigs: [join(__dirname, './config')]
})
export class AutoConfiguration{
  async onReady(container?: IMidwayContainer): Promise<void>{
    await container.getAsync('rabbitmq:rabbitmqProducer');
  }
}
