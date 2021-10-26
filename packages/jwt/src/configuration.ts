import { MidwayContainer } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';

@Configuration({
  namespace: 'jwt',
})
export class JwtConfiguration {
  public async onReady(container: MidwayContainer) {}
}
