import { CommonJSFileDetector, Configuration } from '../../../../src';

@Configuration({
  detector: new CommonJSFileDetector({
    ignore: ['**/testing/**']
  }),
})
export class AutoConfiguration {}
