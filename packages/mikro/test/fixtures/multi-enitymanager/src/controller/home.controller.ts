import { Controller, Get } from '@midwayjs/core';
import { InjectEntityManager } from '../../../../../src';
import { EntityManager } from '@mikro-orm/core';
import { Book } from '../entity/book.entity';
import { Author } from '../components/m1/src/entity/author.entity';
@Controller('/')
export class HomeController {

  @InjectEntityManager('default')
  em: EntityManager;

  @Get('/')
  async home() {
    return [
      await this.em.find(Book, 1),
      await this.em.find(Author, 1),
    ]
  }
}
