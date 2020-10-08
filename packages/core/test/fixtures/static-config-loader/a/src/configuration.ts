import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    'b'
  ],
})
export class AutoConfiguration {
  async onReady() {
  }
}
