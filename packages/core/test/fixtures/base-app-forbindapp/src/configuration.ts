import { ILifeCycle, IMidwayApplication } from '../../../../src';
import { Configuration, App } from '@midwayjs/decorator';

@Configuration({
  imports: [],
  importObjects: {
    aa: 123,
  },
})
class AutoConfiguraion implements ILifeCycle {
  @App()
  test: IMidwayApplication;

  async onReady() {
    if (this.test.getBaseDir() !== 'hello this is basedir') {
      throw new Error('midway core application error');
    }
  }
}

module.exports = AutoConfiguraion;
