import {
  Config,
  Init,
  Inject,
  Logger,
  ServiceFactory,
  MidwayCommonError,
  delegateTargetAllPrototypeMethod,
  ServiceFactoryConfigOption,
  Singleton,
  ILogger,
  MidwayTraceService,
} from '@midwayjs/core';
import Consul = require('consul');
import { ConsulClient, ConsulOptions } from './interface';

@Singleton()
export class ConsulServiceFactory extends ServiceFactory<ConsulClient> {
  @Config('consul')
  consulConfig: ServiceFactoryConfigOption<ConsulOptions>;

  @Config('consul.tracing.meta')
  traceMetaResolver;

  @Config('consul.tracing.enable')
  traceEnabled;

  @Config('consul.tracing.injector')
  traceInjector;

  @Init()
  async init() {
    await this.initClients(this.consulConfig, {
      concurrent: true,
    });
  }

  @Logger('coreLogger')
  logger: ILogger;

  @Inject()
  traceService: MidwayTraceService;

  async createClient(
    config: ConsulOptions,
    clientName: string
  ): Promise<InstanceType<typeof Consul>> {
    const { customClientClass, ...otherConfig } = config as any;
    if (customClientClass) {
      const client = new customClientClass(otherConfig);
      this.bindTraceContext(client as any, clientName);
      return client;
    }

    this.logger.info(
      '[midway:consul] init %s at %s:%s',
      clientName,
      config.host,
      config.port
    );
    const client = new Consul(config);
    this.bindTraceContext(client as any, clientName);
    return client;
  }

  protected bindTraceContext(client: any, clientName: string) {
    if (!client || !this.traceService) {
      return;
    }

    const rawRequest = client.request?.bind(client);
    if (!rawRequest) {
      return;
    }

    client.request = (...args) => {
      const hasCallback = args.some(arg => typeof arg === 'function');
      if (hasCallback) {
        return rawRequest(...args);
      }

      const requestOptions = args?.[0] ?? {};
      const isWatch = Boolean(
        requestOptions?.watch ??
        requestOptions?.qs?.watch ??
        requestOptions?.query?.watch
      );
      if (isWatch) {
        return rawRequest(...args);
      }

      const requestMethod = requestOptions?.method ?? 'request';
      const rawCarrier =
        typeof this.traceInjector === 'function'
          ? this.traceInjector({
              request: requestOptions,
              custom: {
                clientName,
                requestMethod: String(requestMethod),
              },
            })
          : {};
      const carrier =
        rawCarrier && typeof rawCarrier === 'object' ? rawCarrier : {};
      return this.traceService.runWithExitSpan(
        `consul.${String(requestMethod).toLowerCase()}`,
        {
          enable: this.traceEnabled !== false,
          carrier,
          attributes: {
            'midway.protocol': 'consul',
            'midway.consul.client': clientName,
            'midway.consul.method': String(requestMethod),
          },
          meta: this.traceMetaResolver,
          metaArgs: {
            carrier,
            request: requestOptions,
            custom: {
              clientName,
              requestMethod: String(requestMethod),
            },
          },
        },
        async () => rawRequest(...args)
      );
    };
  }

  getName() {
    return 'consul';
  }

  async destroyClient(client: InstanceType<typeof Consul>, clientName: string) {
    this.logger.info('[midway:consul] destroy %s', clientName);
    client.destroy();
  }
}

@Singleton()
export class ConsulService implements InstanceType<typeof Consul> {
  @Inject()
  private serviceFactory: ConsulServiceFactory;

  private instance: InstanceType<typeof Consul>;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('consul default instance not found.');
    }
  }
}

export interface ConsulService extends InstanceType<typeof Consul> {
  // empty
}

delegateTargetAllPrototypeMethod(ConsulService, Consul);
