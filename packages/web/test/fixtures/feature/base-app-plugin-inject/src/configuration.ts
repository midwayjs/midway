import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { ILifeCycle } from '@midwayjs/core';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration implements ILifeCycle {
  async onReady() {

  }
  async onObjectCreated(inst) {
    console.log(inst.constructor.name);
  }
}
