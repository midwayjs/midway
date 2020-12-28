import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { BookService } from "../components/book/src/bookService";

@Provide()
@Controller('/user')
export class UserController {
  @Inject('book:bookService')
  bookService: BookService;

  @Get('/list_books')
  async getBooksByUser() {
    return this.bookService.getAllBooks();
  }
}
