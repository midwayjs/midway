import { Configuration } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: require('./config/config.default'),
      unittest: require('./config/config.unittest')
    }
  ],
})
export class AutoConfiguration {
  async onReady() {
    console.log('ready');
  }
}
