import { IMidwayContainer } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'rabbitmq'
})
export class AutoConfiguration{
  async onReady(container?: IMidwayContainer): Promise<void>{
    await container.getAsync('rabbitmq:rabbitmqProducer');
  }
}
