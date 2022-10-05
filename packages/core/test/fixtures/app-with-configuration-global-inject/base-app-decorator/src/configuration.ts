import { Configuration } from '../../../../../src';

@Configuration({
  imports: [
    require('../../sql/'),
  ],
})
export class AutoConfiguration {
  async onReady(container) {
    container.registerObject('ccc', 'dddd');
  }
}
