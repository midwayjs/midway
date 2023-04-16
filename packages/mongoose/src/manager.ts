import {
  DataSourceManager,
  delegateTargetMethod,
  delegateTargetProperties,
  MidwayCommonError,
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import * as mongoose from 'mongoose';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MongooseDataSourceManager extends DataSourceManager<mongoose.Connection> {
  @Config('mongoose')
  config;

  @Logger('coreLogger')
  logger;

  @Inject()
  baseDir: string;

  @Init()
  async init() {
    if (this.config.client) {
      this.logger.warn(
        '[midway:mongoose] mongoose.client is deprecated, please use new config format.'
      );
      this.config.dataSource = {
        default: this.config.client,
      };
    }
    if (this.config.clients) {
      this.logger.warn(
        '[midway:mongoose] mongoose.clients is deprecated, please use new config format.'
      );
      this.config.dataSource = this.config.clients;
    }
    await this.initDataSource(this.config, this.baseDir);
  }

  protected async createDataSource(config: any, name: string) {
    const connection = (await mongoose.createConnection(
      config.uri,
      config.options
    )) as any;
    connection.on('error', err => {
      err.message = `[midway:mongoose] ${err.message}`;
      this.logger.error(err);
    });

    /* istanbul ignore next */
    connection.on('disconnected', () => {
      this.logger.info(`[midway:mongoose] ${name} disconnected`);
    });

    connection.on('connected', () => {
      this.logger.info(`[midway:mongoose] ${name} connected successfully`);
    });

    /* istanbul ignore next */
    connection.on('reconnected', () => {
      this.logger.info(`[midway:mongoose] ${name} reconnected successfully`);
    });

    if (config.entities) {
      (connection as any).entities = config.entities;
    }
    return connection;
  }

  getName() {
    return 'mongoose';
  }

  async destroyDataSource(dataSource: mongoose.Connection) {
    await dataSource.close();
  }

  protected async checkConnected(
    dataSource: mongoose.Connection
  ): Promise<boolean> {
    return dataSource.readyState === mongoose.ConnectionStates.connected;
  }
}

/**
 * @deprecated
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class MongooseConnectionServiceFactory {
  @Inject()
  mongooseDataSourceManager: MongooseDataSourceManager;

  createInstance(
    config: any,
    clientName: any
  ): Promise<void | mongoose.Connection> {
    return this.mongooseDataSourceManager.createInstance(config, clientName);
  }

  get(id: string): mongoose.Connection {
    return this.mongooseDataSourceManager.getDataSource(id);
  }

  getName(): string {
    return 'mongoose';
  }

  has(id: string): boolean {
    return this.mongooseDataSourceManager.hasDataSource(id);
  }
}

/**
 * @deprecated
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class MongooseConnectionService implements mongoose.Connection {
  @Inject()
  private mongooseDataSourceManager: MongooseDataSourceManager;

  private instance: mongoose.Connection;

  @Init()
  async init() {
    this.instance = this.mongooseDataSourceManager.getDataSource('default');
    if (!this.instance) {
      throw new MidwayCommonError('mongoose default instance not found.');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MongooseConnectionService extends mongoose.Connection {
  // empty
}

delegateTargetMethod(MongooseConnectionService, [
  'close',
  'collection',
  'createCollection',
  'deleteModel',
  'dropCollection',
  'dropDatabase',
  'get',
  'getClient',
  'model',
  'modelNames',
  'openUri',
  'plugin',
  'set',
  'setClient',
  'startSession',
  'transaction',
  'useDb',
  'watch',
]);

delegateTargetProperties(MongooseConnectionService, [
  'client',
  'collections',
  'config',
  'db',
  'host',
  'id',
  'models',
  'name',
  'pass',
  'plugins',
  'port',
  'readyState',
  'user',
]);
