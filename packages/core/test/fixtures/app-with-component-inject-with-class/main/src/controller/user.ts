import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { BookService, dynamicCacheServiceHandler } from '../../../book';

@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  bookService: BookService;

  @Inject('book:dynamicCacheService')
  cacheService: typeof dynamicCacheServiceHandler;

  @Get('/list_books')
  async getBooksByUser() {
    console.log(this.cacheService);
    return this.bookService.getAllBooks();
  }
}
