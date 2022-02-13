import { Configuration, Inject } from '@midwayjs/decorator';
// import * as book from 'midway-test-component';
import { BookService } from 'midway-test-component';

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
