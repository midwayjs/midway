import { DataSourceManager } from '../../src';
import { DataSource, DataSourceConfig, DataSourceItem, globModels } from '../../src/common/dataSourceManager';

describe('test/common/dataSourceManager.test.ts', () => {

  const host = `schema://${Math.random().toString()}`;
  interface Dbh {
    host: string;
    entitiesLength: number;
  }

  class CustomDataSourceFactory<SourceName extends string> extends DataSourceManager<Dbh, SourceName> {
    getName() {
      return 'test';
    }
    async init(options: DataSourceConfig<SourceName>) {
      return super.initDataSource(options, __dirname);
    }

    protected createDataSource(
      config: DataSourceItem,
      dataSourceName: SourceName
      ): any {

      config.entitiesLength = config.entities.length;
      config.host = host
      return config;
    }

    protected async checkConnected(dataSource: any) {
      return false;
    }

    protected async destroyDataSource(dataSource: any): Promise<void> {
      return;
    }
  }

  it('should test base data source', async () => {
    class EntityA {}

    class EntityB {}

    const config = {
      dataSource: {
        default: {
          host: 'localhost',    //数据库地址,默认本机
          port:'3306',
          dialect: 'mysql',
          pool: {   //连接池设置
            max: 5, //最大连接数
            min: 0, //最小连接数
            idle: 10000
          },
          entities: [EntityA, EntityB]
        },
        test: {
          host: 'localhost',    //数据库地址,默认本机
          port:'3306',
          dialect: 'mysql',
          pool: {   //连接池设置
            max: 5, //最大连接数
            min: 0, //最小连接数
            idle: 10000
          },
          dataSourceGroup: 'bb',
          entities: [EntityA]
        }
      },
    } as const

    const instance = new CustomDataSourceFactory<keyof typeof config.dataSource>();
    expect(instance.getName()).toEqual('test');

    await instance.init(config)
    expect(instance.getDataSourceNames()).toEqual(['default', 'test']);
    expect(instance.hasDataSource('default')).toBeTruthy();
    expect(instance.getDataSource('default')).toMatchSnapshot();
    expect(instance.getDataSource('default').entitiesLength).toEqual(2);
    expect(instance.getDataSource('default').host).toEqual(host);
    expect(instance.getDataSource('test')).toMatchSnapshot();
    expect(instance.getDataSource('test').entitiesLength).toEqual(1);
    expect(instance.getDataSource('test').host).toEqual(host);
    // @ts-expect-error
    expect(instance.getDataSource('fff')).not.toBeDefined();

    expect(await instance.isConnected('default')).toBeFalsy();

    expect(instance.getDataSourceNameByModel(EntityB)).toEqual('default');
    expect(instance.getDataSourceNameByModel(EntityA)).toEqual('test');

    await instance.stop();
    expect(instance.getDataSourceNames()).toEqual([]);
  });

  it('should test glob model', function () {
    let result = globModels('dd', __dirname);
    expect(result).toEqual([]);

    result = globModels('abc', __dirname);
    expect(result.length).toEqual(4);
  });

  it('should test with glob model', async () => {
    class EntityA {}

    const config = {
      dataSource: {
        test: {
          host: 'localhost',    //数据库地址,默认本机
          port:'3306',
          dialect: 'mysql',
          pool: {   //连接池设置
            max: 5, //最大连接数
            min: 0, //最小连接数
            idle: 10000
          },
          entities: [EntityA, EntityA, '/abc']
        },
      },
    }

    const instance = new CustomDataSourceFactory<keyof typeof config.dataSource>();
    expect(instance.getName()).toEqual('test');

    await instance.init(config)
    expect(instance.getDataSourceNames()).toEqual(['test']);
    expect(instance.getDataSource('test')).toMatchSnapshot();
  });

  it('should test will got error when no data source', async () => {
    const instance = new CustomDataSourceFactory();
    let e;
    try {
      // @ts-expect-error
      await instance.init({});
    } catch (err) {
      e = err;
    }

    expect(e).toBeDefined();
  });

  it('should test base data source with types', async () => {
    class EntityA {}

    class EntityB {}

    type Config = DataSourceConfig<'default' | 'test'>

    const config: Config = {
      dataSource: {
        default: {
          host: 'localhost',    //数据库地址,默认本机
          port:'3306',
          dialect: 'mysql',
          pool: {   //连接池设置
            max: 5, //最大连接数
            min: 0, //最小连接数
            idle: 10000
          },
          entities: [EntityA, EntityB]
        },
        test: {
          host: 'localhost',    //数据库地址,默认本机
          port:'3306',
          dialect: 'mysql',
          pool: {   //连接池设置
            max: 5, //最大连接数
            min: 0, //最小连接数
            idle: 10000
          },
          dataSourceGroup: 'bb',
          entities: [EntityA]
        }
      },
    }

    const instance = new CustomDataSourceFactory<keyof Config['dataSource']>();
    expect(instance.getName()).toEqual('test');

    await instance.init(config)
    expect(instance.getDataSourceNames()).toEqual(['default', 'test']);
    expect(instance.hasDataSource('default')).toBeTruthy();
    expect(instance.getDataSource('default')).toMatchSnapshot();
    expect(instance.getDataSource('default').entitiesLength).toEqual(2);
    expect(instance.getDataSource('test')).toMatchSnapshot();
    expect(instance.getDataSource('test').entitiesLength).toEqual(1);
    // @ts-expect-error
    expect(instance.getDataSource('fff')).not.toBeDefined();

    expect(await instance.isConnected('default')).toBeFalsy();

    expect(instance.getDataSourceNameByModel(EntityB)).toEqual('default');
    expect(instance.getDataSourceNameByModel(EntityA)).toEqual('test');

    await instance.stop();
    expect(instance.getDataSourceNames()).toEqual([]);
  });
});
