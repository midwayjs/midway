import { Configuration } from '@midwayjs/core';

@Configuration({
  imports: [
    require('./component/sql/src')
  ],
})
export class ContainerConfiguration {}
