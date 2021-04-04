import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { BookService } from '../../../book';

@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  bookService: BookService;

  @Get('/list_books')
  async getBooksByUser() {
    return this.bookService.getAllBooks();
  }
}
