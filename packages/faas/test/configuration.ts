import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  imports: [
    join(__dirname, './fixtures/midway-plugin-mod')
  ],
  importConfigs: [
    join(__dirname, './config.default')
  ]
})
export class ContainerLifeCycle {
}
