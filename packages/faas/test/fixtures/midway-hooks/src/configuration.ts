import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    './config/config.default',
    './config/config.local',
    './config/config.daily',
    './config/config.pre',
  ],
})
export class ContainerConfiguration {}
