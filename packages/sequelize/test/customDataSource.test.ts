import { close, createLightApp } from '@midwayjs/mock';
import * as sequelize from '../src';

describe('/test/customDataSource.test.ts', () => {
  class CustomSequelize {
    public static configs: any[] = [];
    public addModels = jest.fn();
    public sync = jest.fn();

    constructor(public config: any) {
      CustomSequelize.configs.push(config);
    }

    async authenticate() {
      return true;
    }

    async close() {}
  }

  beforeEach(() => {
    CustomSequelize.configs = [];
  });

  it('should create a custom data source from merged default config', async () => {
    const app = await createLightApp({
      imports: [sequelize],
      globalConfig: {
        sequelize: {
          default: {
            customDataSourceClass: CustomSequelize,
          },
          dataSource: {
            default: {
              dialect: 'sqlite',
            },
          },
        },
      },
    });

    const manager = await app
      .getApplicationContext()
      .getAsync(sequelize.SequelizeDataSourceManager);
    const defaultDataSource = manager.getDataSource(
      'default'
    ) as unknown as CustomSequelize;

    expect(defaultDataSource).toBeInstanceOf(CustomSequelize);
    expect(CustomSequelize.configs).toHaveLength(1);
    expect(CustomSequelize.configs[0].customDataSourceClass).toBeUndefined();
    expect(CustomSequelize.configs[0].dialect).toBe('sqlite');

    await close(app);
  });

  it('should create custom data sources using customDataSourceClass', async () => {
    class User {}
    const syncOptions = {
      force: true,
    };
    const app = await createLightApp({
      imports: [sequelize],
      globalConfig: {
        sequelize: {
          dataSource: {
            default: {
              customDataSourceClass: CustomSequelize,
              dialect: 'sqlite',
            },
            reporting: {
              customDataSourceClass: CustomSequelize,
              dialect: 'sqlite',
              entities: [User],
              sync: true,
              syncOptions,
            },
          },
        },
      },
    });

    const manager = await app
      .getApplicationContext()
      .getAsync(sequelize.SequelizeDataSourceManager);
    const defaultDataSource = manager.getDataSource(
      'default'
    ) as unknown as CustomSequelize;
    const reportingDataSource = manager.getDataSource(
      'reporting'
    ) as unknown as CustomSequelize;

    expect(defaultDataSource).toBeInstanceOf(CustomSequelize);
    expect(reportingDataSource).toBeInstanceOf(CustomSequelize);
    expect(CustomSequelize.configs).toHaveLength(2);
    expect(
      CustomSequelize.configs.every(config => !config.customDataSourceClass)
    ).toBe(true);
    expect(reportingDataSource.addModels).toHaveBeenCalledWith([User]);
    expect(reportingDataSource.sync).toHaveBeenCalledWith(syncOptions);

    await close(app);
  });
});
