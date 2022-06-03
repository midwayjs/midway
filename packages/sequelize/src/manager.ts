import {
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  listModule,
} from '@midwayjs/decorator';
import {
  ServiceFactory,
  delegateTargetAllPrototypeMethod,
} from '@midwayjs/core';
import { Sequelize } from 'sequelize-typescript';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SequelizeServiceFactory extends ServiceFactory<Sequelize> {
  @Config('sequelize')
  sequelizeConfig;

  @Logger('coreLogger')
  logger;

  @Init()
  async init() {
    if (!this.sequelizeConfig.client && !this.sequelizeConfig.clients) {
      this.sequelizeConfig.client = this.sequelizeConfig;
    }
    await this.initClients(this.sequelizeConfig);
  }

  protected async createClient(config): Promise<Sequelize> {
    const options = config.options;
    const client = new Sequelize(options);
    const entities = listModule('sequelize:core');
    client.addModels(entities);
    await client.authenticate();

    if (config.sync) {
      await client.sync();
    }

    this.logger.info('[midway:sequelize] connecting start');
    return client;
  }

  getName() {
    return 'sequelize';
  }

  async destroyClient(sequelizeInstance) {
    try {
      await (sequelizeInstance && sequelizeInstance.close());
    } catch (error) {
      this.logger.error('[midway:sequelize] sequelize quit failed.', error);
    }
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class SequelizeService implements Sequelize {
  @Inject()
  private serviceFactory: SequelizeServiceFactory;

  // @ts-expect-error used
  private instance: Sequelize;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SequelizeService extends Sequelize {
  // empty
}

delegateTargetAllPrototypeMethod(SequelizeService, Sequelize);
