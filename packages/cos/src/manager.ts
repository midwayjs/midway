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
import * as assert from 'assert';
import * as COS from 'cos-nodejs-sdk-v5';

@Provide()
@Scope(ScopeEnum.Singleton)
export class COSServiceFactory extends ServiceFactory<COS> {
  @Config('cos')
  cosConfig;

  @Init()
  async init() {
    await this.initClients(this.cosConfig);
  }

  @Logger('coreLogger')
  logger;

  async createClient(config): Promise<COS> {
    assert(
      config.secretId && config.secretKey,
      '[@midwayjs/cos] secretId secretKey is required on config'
    );
    this.logger.info('[@midwayjs/cos] init %s', config.secretId);

    return new COS({
      SecretId: config.secretId,
      SecretKey: config.secretKey,
    });
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

  // @ts-expect-error used
  private instance: COS;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get('default');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface COSService extends COS {
  // empty
}

delegateTargetPrototypeMethod(COSService, [COS]);
