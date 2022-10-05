import { Configuration } from '@midwayjs/core';

@Configuration({
  imports: [
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        jwt: {
          expiresIn: '200s',
          secret: '123',
        }
      }
    }
  ]
})
export class AutoConfiguration {
}
