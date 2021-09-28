import { Provide, Controller, Inject, Get } from '@midwayjs/decorator';
import { BookService, dynamicCacheServiceHandler } from '../../../book';
import { BookServiceOne } from '../../../bookstr';

@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  bookService: BookService;

  @Inject()
  bookServiceOne: BookServiceOne;

  @Inject('book:dynamicCacheService')
  cacheService: typeof dynamicCacheServiceHandler;

  @Get('/list_books')
  async getBooksByUser() {
    if (!this.cacheService) {
      throw new Error('cache service is undefined');
    }
    const books = await this.bookServiceOne.getAllBooks();
    return books.concat(await this.bookService.getAllBooks());
  }
}
