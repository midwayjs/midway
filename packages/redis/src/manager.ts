import {
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { ServiceFactory, delegateTargetPrototypeMethod } from '@midwayjs/core';
import * as Redis from 'ioredis';
import * as assert from 'assert';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisServiceFactory extends ServiceFactory<Redis.Redis> {
  @Config('redis')
  redisConfig;

  @Init()
  async init() {
    await this.initClients(this.redisConfig);
  }

  @Logger('coreLogger')
  logger;

  async createClient(config): Promise<Redis.Redis> {
    let client;

    if (config.cluster === true) {
      assert(
        config.nodes && config.nodes.length !== 0,
        '[@midwayjs/redis] cluster nodes configuration is required when use cluster redis'
      );

      config.nodes.forEach(client => {
        assert(
          client.host &&
            client.port &&
            `[@midwayjs/redis] 'host: ${client.host}', 'port: ${client.port}' are required on config`
        );
      });
      this.logger.info('[@midwayjs/redis] cluster connecting');
      client = new Redis.Cluster(config.nodes, config);
    } else if (config.sentinels) {
      assert(
        config.sentinels && config.sentinels.length !== 0,
        '[@midwayjs/redis] sentinels configuration is required when use redis sentinel'
      );

      config.sentinels.forEach(sentinel => {
        assert(
          sentinel.host && sentinel.port,
          `[@midwayjs/redis] 'host: ${sentinel.host}', 'port: ${sentinel.port}' are required on config`
        );
      });

      this.logger.info('[@midwayjs/redis] sentinel connecting start');
      client = new Redis(config);
    } else {
      assert(
        config.host && config.port,
        `[@midwayjs/redis] 'host: ${config.host}', 'port: ${config.port}' are required on config`
      );
      this.logger.info(
        '[@midwayjs/redis] server connecting redis://:***@%s:%s/%s',
        config.host,
        config.port
      );
      client = new Redis(config);
    }

    client.on('connect', () => {
      this.logger.info('[@midwayjs/redis] client connect success');
    });
    client.on('error', err => {
      this.logger.error('[@midwayjs/redis] client error: %s', err);
      this.logger.error(err);
    });

    return client;
  }

  getName() {
    return 'redis';
  }

  async destroyClient(redisInstance) {
    try {
      await (redisInstance && redisInstance.quit());
    } catch (error) {
      this.logger.error('[@midwayjs/redis] Redis quit failed.', error);
    }
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisService implements Redis.Redis {
  @Inject()
  private serviceFactory: RedisServiceFactory;

  // @ts-expect-error used
  private instance: Redis.Redis;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedisService extends Redis.Redis {
  // empty
}

delegateTargetPrototypeMethod(RedisService, [Redis]);
