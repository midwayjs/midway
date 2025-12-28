import {
  CommonJSFileDetector,
  Configuration,
} from '@midwayjs/core';
import { join } from 'path';
import * as piscina from '../../../../src';

@Configuration({
  imports: [piscina],
  detector: new CommonJSFileDetector({
    ignore: ['**/worker/**'],
  }),
  importConfigs: [
    {
      default: {
        piscina: {
          client: {
            workerFile: join(__dirname, './worker/index.ts'),
          },
        },
      },
    },
  ],
})
export class ContainerConfiguration {
}
