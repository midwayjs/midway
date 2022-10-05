import { Configuration } from '../../../../src';

@Configuration({
  detectorOptions: {
    ignore: ['**/testing/**']
  }
})
export class AutoConfiguration {}
