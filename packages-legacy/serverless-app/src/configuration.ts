import { Configuration } from '@midwayjs/core';
import * as faas from '@midwayjs/faas';

@Configuration({
  namespace: 'serverless-app',
  imports: [faas],
  importConfigs: [
    {
      default: {
        faas: {
          developmentRun: true,
        },
      },
    },
  ],
})
export class ServerlessAppConfiguration {}
