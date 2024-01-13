import { Configuration } from '@midwayjs/core';

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        jwt: {
          sign: {
            expiresIn: '200s',
            algorithm: 'HS256',
          },
          verify: {
            expiresIn: '200s',
            algorithms: ['HS256'],
            clockTolerance: 30,
            ignoreExpiration: true,
          },
          secret: '123',
        }
      }
    }
  ]
})
export class AutoConfiguration {
}
