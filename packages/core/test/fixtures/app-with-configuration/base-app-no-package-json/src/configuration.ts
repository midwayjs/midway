import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('../../midway-plugin-mock/src'),
    require('../../midway-plugin-ok/src'),
    require('../../midway-plugin-no-pkg-json/dist'),
    require('../../midway-plugin-oktwo/src')
  ],
  importObjects: {
    aa: 123
  }
})
export class AutoConfiguration {}
