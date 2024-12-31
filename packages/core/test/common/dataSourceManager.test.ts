import { DataSourceManager } from '../../src';
import { globModels, formatGlobString } from '../../src/common/dataSourceManager';
import { join } from 'path';
import * as assert from 'assert';

describe('test/common/dataSourceManager.test.ts', () => {

  class CustomDataSourceFactory extends DataSourceManager<any> {
    getName() {
      return 'test';
    }
    async init(options, initOptions?) {
      return super.initDataSource(options, {
        baseDir: __dirname,
        ...initOptions
      });
    }

    protected createDataSource(config, dataSourceName: string): any {
      return new Promise(resolve => {
        setTimeout(() => {
          config.entitiesLength = config.entities?.length || 0;
          config.createdAt = Date.now();
          resolve(config);
        }, 100);
      });
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
    const defaultDataSource = instance.getDataSource('default');
    expect({
      ...defaultDataSource,
      createdAt: undefined // 忽略 createdAt 字段
    }).toMatchSnapshot();
    expect(instance.getDataSource('default').entitiesLength).toEqual(2);
    const testDataSource = instance.getDataSource('test');
    expect({
      ...testDataSource,
      createdAt: undefined // 忽略 createdAt 字段
    }).toMatchSnapshot();
    expect(instance.getDataSource('test').entitiesLength).toEqual(1);
    expect(instance.getDataSource('fff')).not.toBeDefined();

    expect(await instance.isConnected('default')).toBeFalsy();

    expect(instance.getDataSourceNameByModel(EntityB)).toEqual('default');
    expect(instance.getDataSourceNameByModel(EntityA)).toEqual('test');

    await instance.stop();
    expect(instance.getDataSourceNames()).toEqual([]);
  });

  it('should test glob model', async () => {
    let result = await globModels('dd', __dirname);
    expect(result).toEqual([]);

    result = await globModels('abc', __dirname);
    expect(result.length).toEqual(6);
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
    const dataSource = instance.getDataSource('test');
    expect({
      ...dataSource,
      createdAt: undefined // 忽略 createdAt 字段
    }).toMatchSnapshot();
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

  it('should test default name', async () => {
    const instance = new CustomDataSourceFactory();
    await instance.init({
      defaultDataSourceName: 'abc',
      dataSource: {}
    })
    expect(instance.getDefaultDataSourceName()).toEqual('abc');
  });

  it('should test default name when there is only one data source', async () => {
    let instance = new CustomDataSourceFactory();
    expect(instance.getDefaultDataSourceName()).toEqual('');
    expect(instance.getDefaultDataSourceName()).toEqual('');
    instance = new CustomDataSourceFactory();
    instance['dataSource'].set('abc', {});
    expect(instance.getDefaultDataSourceName()).toEqual('abc');
  });

  it('should test glob model with pattern string', async () => {
    let result = await globModels('**/bcd/**', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(1);

    result = await globModels('abc/*.ts', __dirname);
    expect(result.length).toEqual(4);

    result = await globModels('/abc', __dirname);
    expect(result.length).toEqual(6);

    result = await globModels('abc/a.ts', __dirname);
    expect(result.length).toEqual(2);

    result = await globModels('**/a.ts', __dirname);
    expect(result.length).toEqual(11);

    result = await globModels('abc/*.ts', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(3);

    result = await globModels('abc/**/*.ts', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(4);

    result = await globModels('abc/*.entity.ts', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(0);

    result = await globModels('**/*.entity.ts', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(1);

    result = await globModels('**/*.{j,t}s', join(__dirname, 'glob_dir_pattern'));
    expect(result.length).toEqual(6);
  });

  describe('test concurrent initialization', () => {
    class EntityA {}
    class EntityB {}

    it('should initialize data sources serially by default', async () => {
      const instance = new CustomDataSourceFactory();
      const startTime = Date.now();
      
      await instance.init({
        dataSource: {
          ds1: {
            entities: [EntityA]
          },
          ds2: {
            entities: [EntityB]
          },
          ds3: {
            entities: [EntityA, EntityB]
          }
        }
      });

      const dataSources = Array.from(instance.getAllDataSources().values());
      const creationTimes = dataSources.map(ds => ds.createdAt);
      
      // 验证数据源是按顺序创建的
      for (let i = 1; i < creationTimes.length; i++) {
        expect(creationTimes[i] - creationTimes[i-1]).toBeGreaterThanOrEqual(90);
      }
      
      // 总时间应该接近 300ms (3个数据源 * 100ms)
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(290);
    });

    it('should initialize data sources concurrently when concurrent option is true', async () => {
      const instance = new CustomDataSourceFactory();
      const startTime = Date.now();
      
      await instance.init({
        dataSource: {
          ds1: {
            entities: [EntityA]
          },
          ds2: {
            entities: [EntityB]
          },
          ds3: {
            entities: [EntityA, EntityB]
          }
        }
      }, { concurrent: true });

      const dataSources = Array.from(instance.getAllDataSources().values());
      const creationTimes = dataSources.map(ds => ds.createdAt);
      
      // 验证所有数据源创建时间应该接近
      for (let i = 1; i < creationTimes.length; i++) {
        expect(creationTimes[i] - creationTimes[i-1]).toBeLessThan(50);
      }
      
      // 总时间应该接近 100ms
      expect(Date.now() - startTime).toBeLessThan(200);
    });

    it('should handle errors in concurrent initialization', async () => {
      class ErrorDataSourceFactory extends CustomDataSourceFactory {
        protected createDataSource(config: any, dataSourceName: string): any {
          if (dataSourceName === 'ds2') {
            throw new Error('Test error');
          }
          return super.createDataSource(config, dataSourceName);
        }
      }

      const instance = new ErrorDataSourceFactory();
      
      await expect(instance.init({
        dataSource: {
          ds1: {
            entities: [EntityA]
          },
          ds2: {
            entities: [EntityB]
          },
          ds3: {
            entities: [EntityA, EntityB]
          }
        }
      }, { concurrent: true })).rejects.toThrow('Test error');

      // 验证在出错时没有数据源被创建
      expect(instance.getAllDataSources().size).toBe(0);
    });

    it('should handle entity loading concurrently', async () => {
      const instance = new CustomDataSourceFactory();
      const startTime = Date.now();
      
      await instance.init({
        dataSource: {
          ds1: {
            entities: ['/abc', '/abc', '/abc'] // 使用多个需要异步加载的实体
          }
        }
      }, { concurrent: true });

      // 由于实体加载也是并发的，总时间应该远小于串行加载的时间
      expect(Date.now() - startTime).toBeLessThan(300);
      
      const ds = instance.getDataSource('ds1');
      expect(ds.entitiesLength).toBeGreaterThan(0);
    });
  });

});

describe('test global pattern', () => {
  it('should test parse global string', function () {
    expect(formatGlobString('/entity')).toEqual([
      '/entity/**/**.ts',
      '/entity/**/**.js',
      '/entity/**/**.mts',
      '/entity/**/**.mjs',
      '/entity/**/**.cts',
      '/entity/**/**.cjs'
    ]);

    expect(formatGlobString('./entity')).toEqual([
      '/entity/**/**.ts',
      '/entity/**/**.js',
      '/entity/**/**.mts',
      '/entity/**/**.mjs',
      '/entity/**/**.cts',
      '/entity/**/**.cjs'
    ]);

    expect(formatGlobString('**/entity')).toEqual([
      '**/entity/**/**.ts',
      '**/entity/**/**.js',
      '**/entity/**/**.mts',
      '**/entity/**/**.mjs',
      '**/entity/**/**.cts',
      '**/entity/**/**.cjs'
    ]);

    expect(formatGlobString('entity')).toEqual([
      '/entity/**/**.ts',
      '/entity/**/**.js',
      '/entity/**/**.mts',
      '/entity/**/**.mjs',
      '/entity/**/**.cts',
      '/entity/**/**.cjs'
    ]);

    expect(formatGlobString('**/abc/**')).toEqual([
      '**/abc/**',
    ]);

    expect(formatGlobString('**/entity/**.entity.ts')).toEqual([
      '**/entity/**.entity.ts',
    ]);

    expect(formatGlobString('entity/abc.ts')).toEqual([
      '/entity/abc.ts',
    ]);

    expect(formatGlobString('**/**/entity/*.entity.{j,t}s')).toEqual([
      '**/**/entity/*.entity.{j,t}s'
    ]);
  });
});

describe('test validate connection and checked it', () => {

  const fakePort = 54321;

  class MockClient {

    constructor(protected config) {
    }

    connect() {
      return true;
    }

    async query() {
      if (this.config.port !== fakePort) {
        return {
          rows: [
            {
              time: Date.now(),
            }
          ]
        };
      }
      throw new Error(`connect ECONNREFUSED ${this.config.host || '127.0.0.1'}:${this.config.port}`);
    }

    end() {
    }
  }

  class CustomDataSourceFactory extends DataSourceManager<any> {
    getName() {
      return 'test';
    }

    async init(options) {
      return super.initDataSource(options, __dirname);
    }

    protected async createDataSource(config, dataSourceName: string): Promise<any> {
      assert.ok(config);
      config.entitiesLength = 0;
      // to skip real connection action
      if (config.port === fakePort) {
        return config;
      }
      const client = new MockClient(config);
      await client.connect();
      return client;
    }

    protected async checkConnected(dataSource: any): Promise<boolean> {
      if (!dataSource || typeof dataSource.query !== 'function') {
        return false;
      }
      const ret = await dataSource.query('SELECT CURRENT_TIMESTAMP as time').then(res => res?.rows[0]);
      console.log({ret});
      return ret && ret.time ? true : false;
    }

    protected async destroyDataSource(dataSource: any): Promise<void> {
      return dataSource.end();
    }
  }

  const clientName = 'test';
  const configDefault = {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'db_ci_test',
  };

  describe('should DataSourceInitOptions.validateConnection work', () => {
    it('default (false)', async () => {
      const instance = new CustomDataSourceFactory();
      expect(instance.getName()).toEqual('test');

      const config = {
        ...configDefault,
      };

      await instance.createInstance(config, clientName);
      expect(instance.getDataSourceNames()).toEqual([clientName]);
    });

    it('false', async () => {
      const instance = new CustomDataSourceFactory();
      expect(instance.getName()).toEqual('test');

      const config = {
        ...configDefault,
      };

      await instance.createInstance(config, clientName, {validateConnection: false});
      expect(instance.getDataSourceNames()).toEqual([clientName]);
    });

    it('true', async () => {
      const instance = new CustomDataSourceFactory();
      expect(instance.getName()).toEqual('test');

      const config = {
        ...configDefault,
      };

      await instance.createInstance(config, clientName, {validateConnection: true});
      expect(instance.getDataSourceNames()).toEqual([clientName]);
    });
  });


  describe('should DataSourceInitOptions.validateConnection work with wrong connection config', () => {
    it('default (false)', async () => {
      const instance = new CustomDataSourceFactory();
      expect(instance.getName()).toEqual('test');

      const clientName = 'test';
      const config = {
        ...configDefault,
        port: fakePort
      };

      await instance.createInstance(config, clientName);
      expect(instance.getDataSourceNames()).toEqual([clientName]);
    });

    it('false', async () => {
      const instance = new CustomDataSourceFactory();
      expect(instance.getName()).toEqual('test');

      const config = {
        ...configDefault,
        port: fakePort
      };

      await instance.createInstance(config, clientName, {validateConnection: false});
      expect(instance.getDataSourceNames()).toEqual([clientName]);
    });

    it('true', async () => {
      const instance = new CustomDataSourceFactory();
      expect(instance.getName()).toEqual('test');

      const config = {
        ...configDefault,
        port: fakePort
      };

      try {
        await instance.createInstance(config, clientName, {validateConnection: true});
      } catch (ex) {
        assert.ok(ex instanceof Error);
        assert.ok(ex.message.includes(clientName));
        assert.ok(ex.message.includes('not connected'));
        return;
      }
      assert.ok(false, 'should throw error but not');
    });
  });

});
