import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'info',
  importConfigs: [
    {
      default: {
        info: {},
      },
    },
  ],
})
export class InfoConfiguration {}
