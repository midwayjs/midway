import { ILifeCycle } from '../../../../../src';
import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('../../midway-plugin-mock/src'),
    require('../../midway-plugin-ok/src')
  ],
  importObjects: {
    aa: 123
  }
})
class AutoConfiguration implements ILifeCycle {
  async onReady() {
    console.log('------auto configuration ready now');
  }
}

module.exports = AutoConfiguration;
