import { ILifeCycle, IMidwayContainer } from '../../src';
import { Provide, Inject, Configuration } from '@midwayjs/decorator';

@Provide()
export class TestBinding {
  async doReady(): Promise<string> {
    return 'hello';
  }
}

@Configuration({})
export class LifeCycleTest implements ILifeCycle {
  ready = false;
  ts: string;

  @Inject()
  testBinding: TestBinding;

  async onReady(container: IMidwayContainer) {
    this.ts = await this.testBinding.doReady();
    container.registerObject('hellotest111', '12312312');
    await new Promise(resolve => {
      setTimeout(() => {
        this.ready = true;
        resolve();
      }, 500);
    });
  }

  async onStop(container: IMidwayContainer) {
    console.log('on stop');
  }
}

@Configuration({})
export class LifeCycleTest1 implements ILifeCycle {
  ready = false;
  tts: string;

  @Inject()
  testBinding: TestBinding;

  async onReady() {
    this.tts = await this.testBinding.doReady();

    await new Promise(resolve => {
      setTimeout(() => {
        this.ready = true;
        resolve();
      }, 500);
    });
  }
}
