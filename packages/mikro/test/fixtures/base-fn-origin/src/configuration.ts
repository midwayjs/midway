import { App, Configuration, Inject } from '@midwayjs/core';
import * as mikro from '../../../../src';
import { join } from 'path';
import { InjectDataSource, InjectRepository } from '../../../../src';
import { IMidwayApplication } from '@midwayjs/core';
import { Book } from './entity';
import { EntityRepository, QueryOrder, wrap } from '@mikro-orm/core';
import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';

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

  @Inject()
  mikroDataSourceManager: mikro.MikroDataSourceManager;

  @InjectDataSource()
  defaultDataSource: MikroORM<IDatabaseDriver<Connection>>;

  @InjectDataSource('default')
  namedDataSource: MikroORM<IDatabaseDriver<Connection>>;

  async onReady() {

    expect(this.defaultDataSource).toBeDefined();
    expect(this.defaultDataSource).toEqual(this.namedDataSource);

    const orm = this.mikroDataSourceManager.getDataSource('default');
    const connection = orm.em.getConnection();
    await (connection as any).loadFile(join(__dirname, '../sqlite-schema.sql'));

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
