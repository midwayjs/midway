import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  delegateTargetPrototypeMethod,
  MidwayCommonError,
  MidwayTraceService,
} from '@midwayjs/core';
import * as OSS from 'ali-oss';
import * as assert from 'assert';
import type {
  OSSServiceFactoryReturnType,
  MWOSSClusterOptions,
  OSSServiceFactoryCreateClientConfigType,
} from './interface';

function checkBucketConfig(config) {
  assert.ok(
    config.endpoint || config.region,
    "[midway:oss] Must set `endpoint` or `region` in oss's config"
  );
  assert.ok(
    config.accessKeySecret && config.accessKeyId,
    "[midway:oss] Must set `accessKeyId` and `accessKeySecret` in oss's config"
  );
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSServiceFactory<
  T extends OSSServiceFactoryReturnType = OSSServiceFactoryReturnType,
> extends ServiceFactory<T> {
  @Config('oss')
  ossConfig: OSSServiceFactoryCreateClientConfigType;

  @Inject()
  protected traceService: MidwayTraceService;

  @Config('oss.tracing.meta')
  protected traceMetaResolver;

  @Config('oss.tracing.enable')
  protected traceEnabled;

  @Config('oss.tracing.injector')
  protected traceInjector;

  @Init()
  async init() {
    await this.initClients(this.ossConfig, {
      concurrent: true,
    });
  }

  async createClient(
    config: OSSServiceFactoryCreateClientConfigType
  ): Promise<T> {
    const { customClientClass, ...otherConfig } = config as any;
    if (customClientClass) {
      const client = new customClientClass(otherConfig);
      this.bindTraceContext(client as any);
      return client;
    }

    if (config['cluster'] && !config.clusters) {
      config.clusters = config['cluster'];
    }
    if (config.clusters) {
      config.clusters.forEach(checkBucketConfig);
      const client = new OSS.ClusterClient(
        config as MWOSSClusterOptions
      ) as unknown as T;
      this.bindTraceContext(client as any);
      return client;
    }

    if (config.sts === true) {
      const client = new OSS.STS(config) as unknown as T;
      this.bindTraceContext(client as any);
      return client;
    }

    checkBucketConfig(config);
    const client = new OSS(config) as unknown as T;
    this.bindTraceContext(client as any);
    return client;
  }

  protected bindTraceContext(client: any) {
    if (!client || !this.traceService) {
      return;
    }

    const rawRequest = client.request?.bind(client);
    if (!rawRequest) {
      return;
    }

    client.request = async (...args) => {
      const requestMethod = args?.[0]?.method || 'request';
      const rawCarrier =
        typeof this.traceInjector === 'function'
          ? this.traceInjector({
              request: args?.[0],
              custom: {
                requestMethod: String(requestMethod),
              },
            })
          : {};
      const carrier =
        rawCarrier && typeof rawCarrier === 'object' ? rawCarrier : {};
      return await this.traceService.runWithExitSpan(
        `oss.${String(requestMethod).toLowerCase()}`,
        {
          enable: this.traceEnabled !== false,
          carrier,
          attributes: {
            'midway.protocol': 'oss',
            'midway.oss.method': String(requestMethod),
          },
          meta: this.traceMetaResolver,
          metaArgs: {
            carrier,
            request: args?.[0],
            custom: {
              requestMethod: String(requestMethod),
            },
          },
        },
        async () => {
          return await rawRequest(...args);
        }
      );
    };
  }

  getName() {
    return 'oss';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSService implements OSS {
  @Inject()
  private serviceFactory: OSSServiceFactory<OSS>;

  private instance: OSS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('oss default instance not found.');
    }
  }
}

export interface OSSService extends OSS {
  // empty
}

delegateTargetPrototypeMethod(OSSService, [OSS]);

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSSTSService implements OSS.STS {
  @Inject()
  private serviceFactory: OSSServiceFactory<OSS.STS>;

  private instance: OSS.STS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('oss sts default instance not found.');
    }
  }

  async assumeRole(
    roleArn: string,
    policy?: Record<string, unknown> | string,
    expirationSeconds?: number,
    session?: string,
    options?: { timeout: number; ctx: any }
  ): Promise<{ credentials: OSS.Credentials }> {
    return this.instance.assumeRole(
      roleArn,
      policy,
      expirationSeconds,
      session,
      options
    );
  }
}
