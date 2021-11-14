import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importObjects: {
    bb: 123,
    cc: 'mock'
  },
  namespace: '@midway-plugin-mock'
})
export class AutoConfiguration {}
