import { Configuration } from '../../../../src'
import * as c from './c';
import * as b from './b';
import * as a from './a';

@Configuration({
  imports: [
    c,
    a,
    b
  ]
})
export class MainConfiguration {
}
