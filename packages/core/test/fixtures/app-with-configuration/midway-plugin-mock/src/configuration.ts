import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importObjects: {
    bb: 123,
    cc: 'mock'
  }
})
export class AutoConfiguration {}
