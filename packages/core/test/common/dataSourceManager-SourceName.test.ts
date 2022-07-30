import { relative } from 'path'

import { DataSourceManager } from '../../src';
import {
  DataSource,
  DataSourceConfig,
  DataSourceItem,
  globModels,
} from '../../src/common/dataSourceManager';

const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  class EntityA { }

  class EntityB { }

  type DataSourceName = 'default' | 'test'
  type Config = DataSourceConfig<DataSourceName>

  const config: Config = {
    dataSource: {
      default: {
        host: 'localhost',    //数据库地址,默认本机
        port: '3306',
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
        port: '3306',
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

  class CustomDataSourceFactory<SourceName extends PropertyKey> extends DataSourceManager<any, SourceName> {
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
    const instance = new CustomDataSourceFactory<DataSourceName>();
    expect(instance.getName()).toEqual('test');

    await instance.init(config)
    expect(instance.getDataSourceNames()).toEqual(['default', 'test']);
    expect(instance.hasDataSource('default')).toBeTruthy();
    // expect(instance.getDataSource('default')).toMatchSnapshot();
    expect(instance.getDataSource('default').entitiesLength).toEqual(2);
    // expect(instance.getDataSource('test')).toMatchSnapshot();
    expect(instance.getDataSource('test').entitiesLength).toEqual(1);
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

    const instance = new CustomDataSourceFactory<'test'>();
    expect(instance.getName()).toEqual('test');

    await instance.init(config)
    expect(instance.getDataSourceNames()).toEqual(['test']);
    // expect(instance.getDataSource('test')).toMatchSnapshot();
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

    const instance = new CustomDataSourceFactory<DataSourceName>();
    expect(instance.getName()).toEqual('test');

    await instance.init(config)
    expect(instance.getDataSourceNames()).toEqual(['default', 'test']);
    expect(instance.hasDataSource('default')).toBeTruthy();
    // expect(instance.getDataSource('default')).toMatchSnapshot();
    expect(instance.getDataSource('default').entitiesLength).toEqual(2);
    // expect(instance.getDataSource('test')).toMatchSnapshot();
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
