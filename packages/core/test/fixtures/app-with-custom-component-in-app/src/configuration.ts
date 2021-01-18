import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from "../../../../src";
import * as bookComponent from './components/book';

@Configuration({
  imports: [
    bookComponent
  ],
})
export class AutoConfiguration implements ILifeCycle {
  async onReady() {
  }
}
