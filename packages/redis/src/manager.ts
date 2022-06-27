import {
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import {
  ServiceFactory,
  delegateTargetAllPrototypeMethod,
  delegateTargetMethod,
} from '@midwayjs/core';
import Redis from 'ioredis';
import * as assert from 'assert';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisServiceFactory extends ServiceFactory<Redis> {
  @Config('redis')
  redisConfig;

  @Init()
  async init() {
    await this.initClients(this.redisConfig);
  }

  @Logger('coreLogger')
  logger;

  async createClient(config): Promise<Redis> {
    let client;

    if (config.cluster === true) {
      assert(
        config.nodes && config.nodes.length !== 0,
        '[midway:redis] cluster nodes configuration is required when use cluster redis'
      );

      config.nodes.forEach(client => {
        assert(
          client.host &&
            client.port &&
            `[midway:redis] 'host: ${client.host}', 'port: ${client.port}' are required on config`
        );
      });
      this.logger.info('[midway:redis] cluster connecting');
      client = new Redis.Cluster(config.nodes, config);
    } else if (config.sentinels) {
      assert(
        config.sentinels && config.sentinels.length !== 0,
        '[midway:redis] sentinels configuration is required when use redis sentinel'
      );

      config.sentinels.forEach(sentinel => {
        assert(
          sentinel.host && sentinel.port,
          `[midway:redis] 'host: ${sentinel.host}', 'port: ${sentinel.port}' are required on config`
        );
      });

      this.logger.info('[midway:redis] sentinel connecting start');
      client = new Redis(config);
    } else {
      assert(
        config.host && config.port,
        `[midway:redis] 'host: ${config.host}', 'port: ${config.port}' are required on config`
      );
      this.logger.info(
        '[midway:redis] server connecting redis://:***@%s:%s/%s',
        config.host,
        config.port
      );
      client = new Redis(config);
    }

    client.on('connect', () => {
      this.logger.info('[midway:redis] client connect success');
    });
    client.on('error', err => {
      this.logger.error('[midway:redis] client error: %s', err);
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
      this.logger.error('[midway:redis] Redis quit failed.', error);
    }
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisService implements Redis {
  @Inject()
  private serviceFactory: RedisServiceFactory;

  // @ts-expect-error used
  private instance: Redis;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedisService extends Redis {
  // empty
}

delegateTargetAllPrototypeMethod(RedisService, Redis);

RedisService.prototype.defineCommand = function (
  name: string,
  definition: {
    lua: string;
    numberOfKeys?: number;
    readOnly?: boolean;
  }
) {
  this.instance.defineCommand(name, definition);
  delegateTargetMethod(RedisService, [name]);
};
