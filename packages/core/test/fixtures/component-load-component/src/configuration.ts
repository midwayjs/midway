import { Configuration, Inject } from '@midwayjs/decorator';
import * as book2 from '@midwayjs-test/test-2';

@Configuration({
  imports: [
    book2
  ],
})
export class AutoConfiguration {

  @Inject()
  bookService: book2.Book2Service;

  async onReady() {
    console.log(this.bookService.getBookById());
  }
}
