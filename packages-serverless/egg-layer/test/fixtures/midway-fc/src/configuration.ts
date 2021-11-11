import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
}
