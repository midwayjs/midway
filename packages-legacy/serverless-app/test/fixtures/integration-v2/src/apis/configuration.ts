import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [
    faas
  ],
  importConfigs: [
    join(__dirname, './config/')
  ],
})
export class ContainerConfiguration {
}
