import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '../../../../src';

@Configuration({
})
export class AutoConfiguration implements ILifeCycle {
  idx = 0;

  @App()
  app;

  async onReady() {
    this.idx++;
    console.log('ready');
  }

  async onBeforeObjectCreated(inst) {
    this.idx+=2;
    this.app.setAttr('total', this.idx);
  }

  async onObjectCreated(inst) {
    this.idx+=3;
    this.app.setAttr('total', this.idx);
  }

  async onServerReady() {
    this.idx+=4;
    this.app.setAttr('total', this.idx);
  }
}
