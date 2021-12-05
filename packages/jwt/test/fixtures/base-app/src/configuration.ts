import { Configuration } from '@midwayjs/decorator';

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
