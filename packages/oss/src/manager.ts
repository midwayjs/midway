import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as OSS from 'ali-oss';
import * as assert from 'assert';
import { ServiceFactory, delegateTargetPrototypeMethod } from '@midwayjs/core';
import { OSSServiceFactoryReturnType, MWOSSClusterOptions, OSSServiceFactoryCreateClientConfigType } from './interface';

function checkBucketConfig(config) {
  assert(
    config.endpoint || config.region,
    "[@midwayjs/oss] Must set `endpoint` or `region` in oss's config"
  );
  assert(
    config.accessKeySecret && config.accessKeyId,
    "[@midwayjs/oss] Must set `accessKeyId` and `accessKeySecret` in oss's config"
  );
}


@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSServiceFactory<T extends OSSServiceFactoryReturnType = OSSServiceFactoryReturnType> extends
  ServiceFactory<T> {
  @Config('oss')
  ossConfig: OSSServiceFactoryCreateClientConfigType;

  @Init()
  async init() {
    await this.initClients(this.ossConfig);
  }

  async createClient(config: OSSServiceFactoryCreateClientConfigType) {

    if (config.clusters) {
      config.clusters.forEach(checkBucketConfig);
      return new OSS.ClusterClient(config as MWOSSClusterOptions);
    }

    if (config.sts === true) {
      return new OSS.STS(config);
    }

    checkBucketConfig(config);
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

  // @ts-expect-error used
  private instance: OSS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
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
  private serviceFactory: OSSServiceFactory<OSS>;

  private instance: OSS.STS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
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
