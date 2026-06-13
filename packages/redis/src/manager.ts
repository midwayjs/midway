import {
  Config,
  delegateTargetAllPrototypeMethod,
  delegateTargetMethod,
  Init,
  Inject,
  Logger,
  MidwayCommonError,
  MidwayTraceService,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  ServiceFactoryConfigOption,
  ILogger,
} from '@midwayjs/core';
import Redis from 'ioredis';
import * as assert from 'assert';
import { RedisConfigOptions } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisServiceFactory extends ServiceFactory<Redis> {
  @Config('redis')
  protected redisConfig: ServiceFactoryConfigOption<RedisConfigOptions>;

  @Init()
  protected async init() {
    await this.initClients(this.redisConfig, {
      concurrent: true,
    });
  }

  @Logger('coreLogger')
  protected logger: ILogger;

  @Inject()
  protected traceService: MidwayTraceService;

  @Config('redis.tracing.meta')
  protected traceMetaResolver;

  @Config('redis.tracing.enable')
  protected traceEnabled;

  @Config('redis.tracing.injector')
  protected traceInjector;

  protected async createClient(config, name: string): Promise<Redis> {
    let client;

    const { customClientClass, ...otherConfig } = config;
    if (customClientClass) {
      client = new customClientClass(otherConfig);
    } else {
      if (config.cluster === true) {
        assert.ok(
          config.nodes && config.nodes.length !== 0,
          `[midway:redis] client(${name}) cluster nodes configuration is required when use cluster redis`
        );

        config.nodes.forEach(client => {
          assert.ok(
            client.host && client.port,
            `[midway:redis] client(${name}) 'host: ${client.host}', 'port: ${client.port}' are required on config`
          );
        });
        client = new Redis.Cluster(config.nodes, config);
        this.logger.info('[midway:redis] cluster is connecting');
      } else if (config.sentinels) {
        assert.ok(
          config.sentinels && config.sentinels.length !== 0,
          `[midway:redis] client(${name}) sentinels configuration is required when use redis sentinel`
        );

        config.sentinels.forEach(sentinel => {
          assert.ok(
            sentinel.host && sentinel.port,
            `[midway:redis] client(${name}) 'host: ${sentinel.host}', 'port: ${sentinel.port}' are required on config`
          );
        });

        client = new Redis(config);
        this.logger.info(
          `[midway:redis] client(${name}) sentinel is connecting`
        );
      } else {
        assert.ok(
          config.host && config.port,
          `[midway:redis] client(${name}) 'host: ${config.host}', 'port: ${config.port}' are required on config`
        );
        client = new Redis(config);
        this.logger.info(
          `[midway:redis] client(${name}) server is connecting redis://:***@${config.host}:${config.port}`
        );
      }
    }

    await new Promise<void>((resolve, reject) => {
      client.on('ready', () => {
        this.logger.info(`[midway:redis] client(${name}) connect success`);
        resolve();
      });
      client.on('error', err => {
        this.logger.error(`[midway:redis] client(${name}) error: ${err}`);
        reject(err);
      });
    });

    this.bindTraceContext(client, name);

    return client;
  }

  protected bindTraceContext(client: Redis, clientName: string) {
    if (!client || !this.traceService) {
      return;
    }

    const rawSendCommand = (client as any).sendCommand?.bind(client);
    if (!rawSendCommand) {
      return;
    }

    (client as any).sendCommand = (command: any, stream?: any) => {
      const commandName =
        command?.name?.toLowerCase?.() || command?.name || 'unknown';
      const rawCarrier =
        typeof this.traceInjector === 'function'
          ? this.traceInjector({
              request: command,
              custom: {
                clientName,
                commandName,
              },
            })
          : {};
      const carrier =
        rawCarrier && typeof rawCarrier === 'object' ? rawCarrier : {};
      return this.traceService.runWithExitSpan(
        `redis.${commandName}`,
        {
          enable: this.traceEnabled !== false,
          carrier,
          attributes: {
            'midway.protocol': 'redis',
            'midway.redis.command': commandName,
            'midway.redis.client': clientName,
          },
          meta: this.traceMetaResolver,
          metaArgs: {
            carrier,
            request: command,
            custom: {
              clientName,
              commandName,
            },
          },
        },
        async () => {
          return rawSendCommand(command, stream);
        }
      );
    };
  }

  getName() {
    return 'redis';
  }

  protected async destroyClient(redisInstance: Redis, name: string) {
    try {
      if (redisInstance) {
        const canQuit = !['end', 'close'].includes(redisInstance.status);
        if (canQuit) {
          await redisInstance.quit();
          this.logger.info(`[midway:redis] client(${name}) quit success`);
        }
      }
    } catch (error) {
      this.logger.error(
        `[midway:redis] client(${name}) Redis quit failed.`,
        error
      );
    }
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisService implements Redis {
  @Inject()
  private serviceFactory: RedisServiceFactory;

  private instance: Redis;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('redis default instance not found.');
    }
  }
}

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
