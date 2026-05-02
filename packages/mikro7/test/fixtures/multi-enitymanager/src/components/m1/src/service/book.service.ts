import midwayCore from '@midwayjs/core';

const { Provide } = midwayCore;

@Provide()
export class BookService {
  async getBookById() {
    return 'hello world';
  }
}
