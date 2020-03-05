import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../midway-plugin-mock/src',
    '../../midway-plugin-ok/src',
    '../../midway-plugin-no-pkg-json/dist'
  ],
  importObjects: {
    aa: 123
  }
})
class AutoConfiguraion {}

module.exports = AutoConfiguraion;
