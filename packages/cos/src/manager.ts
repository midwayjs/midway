import {
  Config,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
  delegateTargetPrototypeMethod,
  MidwayCommonError,
} from '@midwayjs/core';
import * as assert from 'assert';
import * as COS from 'cos-nodejs-sdk-v5';

@Provide()
@Scope(ScopeEnum.Singleton)
export class COSServiceFactory extends ServiceFactory<COS> {
  @Config('cos')
  cosConfig;

  @Init()
  async init() {
    await this.initClients(this.cosConfig, {
      concurrent: true,
    });
  }

  @Logger('coreLogger')
  logger;

  async createClient(config: COS.COSOptions): Promise<COS> {
    assert.ok(
      config.SecretKey && config.SecretId,
      '[@midwayjs/cos] secretId secretKey is required on config'
    );
    this.logger.info('[midway:cos] init %s', config.SecretKey);

    return new COS(config);
  }

  getName() {
    return 'cos';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class COSService implements COS {
  @Inject()
  private serviceFactory: COSServiceFactory;

  private instance: COS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('cos default instance not found.');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface COSService extends COS {
  // empty
}

delegateTargetPrototypeMethod(COSService, [COS]);
