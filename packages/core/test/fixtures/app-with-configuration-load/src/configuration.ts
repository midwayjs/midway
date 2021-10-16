import { Configuration } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('./mod1'),
    {
      component: require('./mod2'),
      enabledEnvironment: ['pre']
    },
    {
      component: require('./mod3'),
    }
  ],
})
export class AutoConfiguration {}
