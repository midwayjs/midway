import { Configuration } from '../../../../src'
import * as c from './c';
import * as b from './b';
import * as a from './a';

@Configuration({
  imports: [
    {
      Configuration: c.Configuration,
    },
    {
      Configuration: a.Configuration,
      AFramework: a.AFramework
    } as any,
    {
      Configuration: b.Configuration,
      BFramework: b.BFramework
    }
  ],
})
export class MainConfiguration {
}
