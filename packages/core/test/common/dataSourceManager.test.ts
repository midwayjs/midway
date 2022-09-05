import { DataSourceManager } from '../../src';
import { globModels } from '../../src/common/dataSourceManager';
import { join } from 'path';

describe('test/common/dataSourceManager.test.ts', () => {

  class CustomDataSourceFactory extends DataSourceManager<any> {
    getName() {
      return 'test';
    }
    async init(options) {
      return super.initDataSource(options, __dirname);
    }

    protected createDataSource(config, dataSourceName: string): any {
      config.entitiesLength = config.entities.length;
      return config;
    }

    protected async checkConnected(dataSource: any) {
      return false;
    }

    protected async destroyDataSource(dataSource: any): Promise<void> {
      return
    }
  }

  it('should test base data source', async () => {
    class EntityA {}

    class EntityB {}

    const instance = new CustomDataSourceFactory();
    expect(instance.getName()).toEqual('test');

    await instance.init({
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
    })
    expect(instance.getDataSourceNames()).toEqual(['default', 'test']);
    expect(instance.hasDataSource('default')).toBeTruthy();
    expect(instance.getDataSource('default')).toMatchSnapshot();
    expect(instance.getDataSource('default').entitiesLength).toEqual(2);
    expect(instance.getDataSource('test')).toMatchSnapshot();
    expect(instance.getDataSource('test').entitiesLength).toEqual(1);
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

  it('should test glob model with pattern string', function () {
    let result = globModels('**/bcd/**', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(1);
  });

  it('should test with glob model', async () => {
    class EntityA {}

    const instance = new CustomDataSourceFactory();
    expect(instance.getName()).toEqual('test');

    await instance.init({
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
    })
    expect(instance.getDataSourceNames()).toEqual(['test']);
    expect(instance.getDataSource('test')).toMatchSnapshot();
  });

  it('should createInstance() without cacheInstance (default true)', async () => {
    class EntityA {}

    const instance = new CustomDataSourceFactory();
    expect(instance.getName()).toEqual('test');


    const clientName ='test'
    const config = {
      host: 'localhost',    //数据库地址,默认本机
      port: '3306',
      dialect: 'mysql',
      pool: {   //连接池设置
        max: 5, //最大连接数
        min: 0, //最小连接数
        idle: 10000
      },
      entities: [EntityA, EntityA, '/abc']
    }

    await instance.createInstance(config, clientName)
    expect(instance.getDataSourceNames()).toEqual([clientName]);
  });

  it('should createInstance() with cacheInstance: true', async () => {
    class EntityA {}

    const instance = new CustomDataSourceFactory();
    expect(instance.getName()).toEqual('test');

    const clientName ='test'
    const config = {
      host: 'localhost',    //数据库地址,默认本机
      port: '3306',
      dialect: 'mysql',
      pool: {   //连接池设置
        max: 5, //最大连接数
        min: 0, //最小连接数
        idle: 10000
      },
      entities: [EntityA, EntityA, '/abc']
    }

    await instance.createInstance(config, clientName, { cacheInstance: true })
    expect(instance.getDataSourceNames()).toEqual([clientName]);
  });

  it('should createInstance() with cacheInstance: false', async () => {
    class EntityA {}

    const instance = new CustomDataSourceFactory();
    expect(instance.getName()).toEqual('test');

    const clientName ='test'
    const config = {
      host: 'localhost',    //数据库地址,默认本机
      port: '3306',
      dialect: 'mysql',
      pool: {   //连接池设置
        max: 5, //最大连接数
        min: 0, //最小连接数
        idle: 10000
      },
      entities: [EntityA, EntityA, '/abc']
    }

    await instance.createInstance(config, clientName, { cacheInstance: false })
    expect(instance.getDataSourceNames()).not.toEqual([clientName]);
    expect(instance.getDataSource(clientName)).toBeUndefined();
  });

  it('should test will got error when no data source', async () => {
    const instance = new CustomDataSourceFactory();
    let e;
    try {
      await instance.init({});
    } catch (err) {
      e = err;
    }

    expect(e).toBeDefined();
  });
});
