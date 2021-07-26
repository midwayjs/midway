import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { HttpService } from './servicManager';

@Configuration({
  namespace: 'httpClient',
  importConfigs: [join(__dirname, './config.default')],
})
export class AutoConfiguration {
  async onReady(container) {
    await container.getAsync(HttpService);
  }
}
