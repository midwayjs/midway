import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { JwtService } from './jwt';
import { JwtUserConfig } from './interface';

export function filterConfig(config: { jwt: JwtUserConfig }) {
  if (config.jwt === undefined) {
    return config;
  }
  if (config.jwt['sign'] || config.jwt['verify'] || config.jwt['decode']) {
    return config;
  } else {
    const secret = config.jwt['secret'];
    delete config.jwt['secret'];
    return {
      jwt: {
        sign: config.jwt,
        secret,
      },
    };
  }
}

@Configuration({
  namespace: 'jwt',
  importConfigs: [
    {
      default: {
        jwt: {},
      },
    },
  ],
  importConfigFilter: filterConfig,
})
export class JwtConfiguration {
  public async onReady(container: IMidwayContainer) {
    await container.getAsync(JwtService);
  }
}
