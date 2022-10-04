import { Configuration, IMidwayContainer } from '@midwayjs/core';
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
  public async onReady(container: IMidwayContainer) {
    await container.getAsync(JwtService);
  }
}
