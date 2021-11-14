// src/service/bookService
import { Provide, ScopeEnum } from '@midwayjs/decorator';
import { providerWrapper, IMidwayContainer } from '../../../../../src';

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

export async function dynamicCacheServiceHandler(container: IMidwayContainer) {
  return () => {
    return 'abc';
  }
}

providerWrapper([
  {
    id: 'book:dynamicCacheService',
    provider: dynamicCacheServiceHandler,
    scope: ScopeEnum.Singleton,
  }
]);
