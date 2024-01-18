import { Provide } from '@midwayjs/core';

@Provide()
export class BookService {
  async getBookById() {
    return 'hello world';
  }
}
