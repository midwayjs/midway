import { MidwayContainer } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import { JwtService } from './jwt';

@Configuration({
  namespace: 'jwt',
  importConfigs: [
    {
      default: {
        jwt: {},
      },
    },
  ],
})
export class JwtConfiguration {
  public async onReady(container: MidwayContainer) {
    await container.getAsync(JwtService);
  }
}
