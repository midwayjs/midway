import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'grpc'
})
export class AutoConfiguration {
  async onReady() {
  }
}
