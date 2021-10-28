import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  namespace: 'info',
  importConfigs: [join(__dirname, './config.default')],
})
export class AutoConfiguration {
  async onReady(container) {
  }
}
