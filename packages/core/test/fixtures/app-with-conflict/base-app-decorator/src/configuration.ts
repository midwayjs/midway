import { ILifeCycle, Configuration } from '../../../../../src';

@Configuration({
  conflictCheck: true,
})
class AutoConfiguraion implements ILifeCycle {
  async onReady() {
    console.log('------auto configuration ready now');
  }
}

module.exports = AutoConfiguraion;
