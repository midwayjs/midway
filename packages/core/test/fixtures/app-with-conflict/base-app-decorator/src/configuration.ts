import { ILifeCycle, Configuration } from '../../../../../src';

@Configuration()
class MainConfiguration implements ILifeCycle {
  async onReady() {
    console.log('------auto configuration ready now');
  }
}

module.exports = MainConfiguration;
