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
} from '@midwayjs/core';
import * as OSS from 'ali-oss';
import * as assert from 'assert';
import type {
  OSSServiceFactoryReturnType,
  MWOSSClusterOptions,
  OSSServiceFactoryCreateClientConfigType,
} from './interface';

function checkBucketConfig(config) {
  assert(
    config.endpoint || config.region,
    "[midway:oss] Must set `endpoint` or `region` in oss's config"
  );
  assert(
    config.accessKeySecret && config.accessKeyId,
    "[midway:oss] Must set `accessKeyId` and `accessKeySecret` in oss's config"
  );
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSServiceFactory<
  T extends OSSServiceFactoryReturnType = OSSServiceFactoryReturnType
> extends ServiceFactory<T> {
  @Config('oss')
  ossConfig: OSSServiceFactoryCreateClientConfigType;

  @Init()
  async init() {
    await this.initClients(this.ossConfig);
  }

  async createClient(
    config: OSSServiceFactoryCreateClientConfigType
  ): Promise<T> {
    if (config['cluster'] && !config.clusters) {
      config.clusters = config['cluster'];
    }
    if (config.clusters) {
      config.clusters.forEach(checkBucketConfig);
      // @ts-expect-error because this code can return the correct type, but TS still reports an error
      return new OSS.ClusterClient(config as MWOSSClusterOptions);
    }

    if (config.sts === true) {
      // @ts-expect-error because this code can return the correct type, but TS still reports an error
      return new OSS.STS(config);
    }

    checkBucketConfig(config);
    // @ts-expect-error because this code can return the correct type, but TS still reports an error
    return new OSS(config);
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
