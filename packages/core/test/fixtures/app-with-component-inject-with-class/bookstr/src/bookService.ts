// src/service/bookService
import { Provide, ScopeEnum } from '@midwayjs/decorator';
import { providerWrapper, IMidwayContainer } from '../../../../../src';

@Provide()
export class BookServiceOne {

  async getAllBooks() {
    return [
      {
        "name": "无限可能str",
        "isbn": "9787115549440str"
      },
      {
        "name": "明智的孩子str",
        "isbn": "9787305236525str"
      },
      {
        "name": "伊卡狛格str",
        "isbn": "9787020166916str"
      }
    ]
  }
}

export async function dynamicCacheServiceHandler(container: IMidwayContainer) {
  return () => {
    return 'abcstr';
  }
}

providerWrapper([
  {
    id: 'dynamicCacheServicestr',
    provider: dynamicCacheServiceHandler,
    scope: ScopeEnum.Singleton,
  }
]);
