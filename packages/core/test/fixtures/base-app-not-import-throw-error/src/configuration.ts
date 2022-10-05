import { Configuration, Inject } from '../../../../src';
import { BookService } from '../../../../../../packages-resource/midway-test-component';

@Configuration({
  imports: [],
})
export class ContainerLifeCycle {

  @Inject()
  bookService: BookService;

  async onReady() {
    console.log('[ Midway ] onReady', this.bookService);
  }
}
