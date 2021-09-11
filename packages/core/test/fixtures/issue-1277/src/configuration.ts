import { Configuration } from '@midwayjs/decorator';
import * as book from 'midway-test-component';

@Configuration({
  imports: [
    book
  ],
})
export class ContainerLifeCycle {
  async onReady() {
    console.log('[ Midway ] onReady')
  }
}
