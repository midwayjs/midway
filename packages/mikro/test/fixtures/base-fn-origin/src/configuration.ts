import { MainApp, Configuration, Inject } from '@midwayjs/core';
import * as mikro from '../../../../src';
import { join } from 'path';
import {
  InjectDataSource,
  InjectRepository,
  InjectEntityManager,
  MikroDataSourceManager,
} from '../../../../src';
import { IMidwayApplication } from '@midwayjs/core';
import { Book } from './entity';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { MikroORM, IDatabaseDriver, Connection, QueryOrder } from '@mikro-orm/core';

@Configuration({
  imports: [mikro],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerConfiguration {
  @InjectRepository(Book)
  bookRepository: EntityRepository<Book>;

  @InjectEntityManager()
  em: EntityManager;

  @MainApp()
  app: IMidwayApplication;

  @Inject()
  mikroDataSourceManager: MikroDataSourceManager;

  @InjectDataSource()
  defaultDataSource: MikroORM<IDatabaseDriver<Connection>>;

  @InjectDataSource('default')
  namedDataSource: MikroORM<IDatabaseDriver<Connection>>;

  async onReady() {
    expect(this.defaultDataSource).toBeDefined();
    expect(this.defaultDataSource).toEqual(this.namedDataSource);

    const connection = this.em.getConnection();
    await connection.loadFile(join(__dirname, '../sqlite-schema.sql'));

    const book = this.bookRepository.create({
      title: 'b1',
      author: { name: 'a1', email: 'e1' },
    });
    await this.em.persist(book).flush();

    const findResult = await this.bookRepository.findAll({
      populate: ['author'],
      orderBy: { title: QueryOrder.DESC },
      limit: 20,
    });

    this.app.setAttr('result', 'hello world' + JSON.stringify(findResult));
  }
}
