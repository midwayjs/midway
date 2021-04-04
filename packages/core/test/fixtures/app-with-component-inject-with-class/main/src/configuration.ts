import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from "../../../../../src";
import * as bookComponent from '../../book';

@Configuration({
  imports: [
    bookComponent
  ],
})
export class AutoConfiguration implements ILifeCycle {
  async onReady() {
  }
}
