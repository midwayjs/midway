import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('./mod1'),
    {
      component: require('./mod2'),
      enabledEnvironment: ['pre']
    }
  ],
})
export class AutoConfiguration {}
