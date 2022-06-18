import { DataSourceManager } from '../../src';

describe('test/common/dataSource.test.ts', () => {

  class CustomDataSourceFactory extends DataSourceManager<any> {
    getName() {
      return 'test';
    }
    async init(options) {
      return super.initDataSource(options);
    }

    protected createDataSource(config, dataSourceName: string): any {
      return config;
    }
  }

  it('should test base data source', async () => {
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
          dataSourceGroup: 'aa'
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
          dataSourceGroup: 'bb'
        }
      },
    })

    expect(instance.getDataSource('default')).toMatchSnapshot();
    expect(instance.getDataSource('test')).toMatchSnapshot();
    expect(instance.getDataSource('fff')).not.toBeDefined();
  });
});
