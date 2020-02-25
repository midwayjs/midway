import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: '',
  importObjects: {
    bb: 123,
    cc: 'mock'
  }
})
export class AutoConfiguraion {}
