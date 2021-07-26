import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import { OSSServiceFactory } from './manager';

@Configuration({
  namespace: 'oss',
  importConfigs: [join(__dirname, './config.default')],
})
export class AutoConfiguration {
  async onReady(container) {
    await container.getAsync(OSSServiceFactory);
  }
}
