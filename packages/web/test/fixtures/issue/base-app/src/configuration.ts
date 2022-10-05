import { Configuration } from '@midwayjs/core';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}
