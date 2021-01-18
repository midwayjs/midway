// src/service/bookService
import { Provide } from '@midwayjs/decorator';

@Provide()
export class BookService {

  async getAllBooks() {
    return [
      {
        "name": "无限可能",
        "isbn": "9787115549440"
      },
      {
        "name": "明智的孩子",
        "isbn": "9787305236525"
      },
      {
        "name": "伊卡狛格",
        "isbn": "9787020166916"
      }
    ]
  }
}
