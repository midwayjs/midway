import { App, Configuration } from '@midwayjs/decorator';
import * as mikro from '../../../../src';
import { join } from 'path';
import { InjectRepository } from '../../../../src';
import { IMidwayApplication } from '@midwayjs/core';
import { Book } from './entity';
import { EntityRepository, QueryOrder, wrap } from '@mikro-orm/core';

@Configuration({
  imports: [
    mikro
  ],
  importConfigs: [
    join(__dirname, './config')
  ]
})
export class ContainerConfiguration {
  @InjectRepository(Book)
  bookRepository: EntityRepository<Book>;

  @App()
  app: IMidwayApplication;

  async onReady() {
    const book = this.bookRepository.create({ title: 'b1', author: { name: 'a1', email: 'e1' } });
    wrap(book.author, true).__initialized = true;
    await this.bookRepository.persist(book).flush();

    const findResult = await this.bookRepository.findAll({
      populate: ['author'],
      orderBy: { title: QueryOrder.DESC },
      limit: 20,
    });

    this.app.setAttr('result', 'hello world' + JSON.stringify(findResult));
  }
}
