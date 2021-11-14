import {
  delegateTargetMethod,
  delegateTargetProperties,
  ServiceFactory,
} from '@midwayjs/core';
import {
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as mongoose from 'mongoose';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MongooseConnectionServiceFactory extends ServiceFactory<mongoose.Connection> {
  @Config('mongoose')
  config;

  @Logger('coreLogger')
  logger;

  @Init()
  async init() {
    await this.initClients(this.config);
  }

  protected async createClient(config: any, name: string) {
    const connection = await mongoose.createConnection(
      config.uri,
      config.options
    );
    connection.on('error', err => {
      err.message = `[mongoose]${err.message}`;
      this.logger.error(err);
    });

    /* istanbul ignore next */
    connection.on('disconnected', () => {
      this.logger.info(`[mongoose] ${name} disconnected`);
    });

    connection.on('connected', () => {
      this.logger.info(`[mongoose] ${name} connected successfully`);
    });

    /* istanbul ignore next */
    connection.on('reconnected', () => {
      this.logger.info(`[mongoose] ${name} reconnected successfully`);
    });

    return connection;
  }

  getName() {
    return 'mongoose';
  }

  async destroyClient(connection: mongoose.Connection) {
    await connection.close();
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class MongooseConnectionService implements mongoose.Connection {
  @Inject()
  private serviceFactory: MongooseConnectionServiceFactory;

  // @ts-expect-error used
  private instance: mongoose.Connection;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
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
