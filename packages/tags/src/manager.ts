import {
  Config,
  Init,
  Singleton,
  ServiceFactory,
  ServiceFactoryConfigOption,
} from '@midwayjs/core';
import { MemoryDialect, MysqlDialect } from './dialect';
import {
  ITagDialect,
  ITagDialectOption,
  ITagMysqlDialectOption,
  ITagUserDialect,
} from './interface';
import { TagClient } from './service';

@Singleton()
export class TagServiceFactory extends ServiceFactory<TagClient> {
  @Config('tags')
  tags: ServiceFactoryConfigOption<ITagDialectOption>;

  @Init()
  async init() {
    await this.initClients(this.tags);
  }

  async createClient(
    config: ITagDialectOption,
    name: string
  ): Promise<TagClient> {
    let dialect: ITagDialect;
    if ((config as any).dialect) {
      dialect = (config as ITagUserDialect).dialect;
    } else if (config.dialectType === 'mysql') {
      dialect = new MysqlDialect(config as ITagMysqlDialectOption);
    } else {
      dialect = new MemoryDialect();
    }
    await dialect.ready();
    return new TagClient(dialect, name);
  }

  getName() {
    return 'tags';
  }
}
