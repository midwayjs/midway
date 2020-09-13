import { ILifeCycle } from '../../../../../src';
import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src'
  ],
  importObjects: {
    aa: 123
  }
})
class AutoConfiguraion implements ILifeCycle {
  async onReady() {
    console.log('------auto configuration ready now');
  }
}

module.exports = AutoConfiguraion;
