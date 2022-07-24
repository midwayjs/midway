import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
  importConfigFilter: (config) => {
    if (config['hello']) {
      config.hello = '123';
    }
    return config;
  }
})
export class AutoConfiguration {
  async onReady() {
    console.log('ready');
  }
}
