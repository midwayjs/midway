import midwayCore, {
  type IMidwayApplication,
} from '@midwayjs/core';
import * as mikro from '../../../../src/index.js';
import { join } from 'path';
import DefaultConfig from './config/config.default.js';
import {
  InjectDataSource,
  InjectRepository,
  InjectEntityManager,
  MikroDataSourceManager,
} from '../../../../src/index.js';
import { Book } from './entity/index.js';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { MikroORM, IDatabaseDriver, Connection, QueryOrder } from '@mikro-orm/core';

const appDir = join(process.env.MIKRO7_FIXTURES_DIR, 'base-fn-origin');
const { MainApp, Configuration, Inject, ESModuleFileDetector } = midwayCore;

@Configuration({
  imports: [mikro],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
  detector: new ESModuleFileDetector({
    ignore: ['**/configuration.ts', '**/config/**', '**/.midway-esm-fallback*/**'],
  }),
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
    if (!this.defaultDataSource) {
      throw new Error('default data source was not injected');
    }
    if (this.defaultDataSource !== this.namedDataSource) {
      throw new Error('named data source did not match default data source');
    }

    const connection = this.em.getConnection();
    await connection.executeDump(
      await import('fs/promises').then(fs =>
        fs.readFile(join(appDir, 'sqlite-schema.sql'), 'utf8')
      )
    );

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
