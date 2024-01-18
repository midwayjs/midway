import { Controller, Get } from '@midwayjs/core';
import { InjectEntityManager } from '../../../../../src';
import { EntityManager } from '@mikro-orm/core';
import { Book } from '../entity/book.entity';
@Controller('/')
export class HomeController {

  @InjectEntityManager('default')
  em: EntityManager;

  @Get('/')
  async home() {
    return await this.em.find(Book, 1);
  }
}
