import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { HttpService } from './serviceManager';

@Configuration({
  namespace: 'axios',
  importConfigs: [join(__dirname, './config.default')],
})
export class AxiosConfiguration {
  async onReady(container) {
    await container.getAsync(HttpService);
  }
}
