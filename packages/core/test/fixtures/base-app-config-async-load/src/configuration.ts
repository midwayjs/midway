import { Configuration } from '@midwayjs/decorator';

@Configuration({
  importConfigs: [
    {
      default: require('./config/config.default'),
      unittest: require('./config/config.unittest')
    }
  ],
})
export class AutoConfiguration {
  async onConfigLoad() {
    return {
      e: 333
    }
  }
  async onReady() {
    console.log('ready');
  }
}
