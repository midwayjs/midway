import { ILifeCycle } from '../../../../../src';
import { Configuration } from '@midwayjs/decorator';

@Configuration({
})
class AutoConfiguraion implements ILifeCycle {
  async onReady() {
    console.log('------auto configuration ready now');
  }
}

module.exports = AutoConfiguraion;
