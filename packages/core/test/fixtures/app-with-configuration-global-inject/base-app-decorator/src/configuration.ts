import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    '../../sql/',
  ],
})
export class AutoConfiguration {
  async onReady(container) {
    container.registerObject('ccc', 'dddd');
  }
}
