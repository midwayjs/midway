import { Controller, Get, Inject } from '@midwayjs/core';
import { BookService } from '../service/bookService';

@Controller('/test')
export class HomeController {
  @Inject()
  bookService: BookService;

  @Inject()
  ctx;

  @Get('/hello')
  async hello() {
    this.ctx.body = await this.bookService.getBookById();
  }
}
