import { Configuration } from '@midwayjs/decorator';

@Configuration({
  detectorOptions: {
    ignore: ['**/testing/**']
  }
})
export class AutoConfiguration {}
