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
import { ServiceFactory } from '@midwayjs/core';

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
export class OSSServiceFactory<T = OSS> extends ServiceFactory<T> {
  @Config('oss')
  ossConfig;

  @Init()
  async init() {
    await this.initClients(this.ossConfig);
  }

  async createClient(config): Promise<T> {
    if (config.cluster) {
      config.cluster.forEach(checkBucketConfig);
      return new (OSS as any).ClusterClient(config);
    }

    if (config.sts === true) {
      return new OSS.STS(config) as any;
    }

    checkBucketConfig(config);
    return new OSS(config) as any;
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

function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor' && !/^_/.test(name)) {
        derivedCtor.prototype[name] = async function (...args) {
          return this.instance[name](...args);
        };
      }
    });
  });
}

applyMixins(OSSService, [OSS]);

@Provide()
@Scope(ScopeEnum.Singleton)
export class OSSSTSService implements OSS.STS {
  @Inject()
  private serviceFactory: OSSServiceFactory<OSS.STS>;

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
