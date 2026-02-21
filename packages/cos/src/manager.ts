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
  MidwayTraceService,
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

  @Inject()
  protected traceService: MidwayTraceService;

  @Config('cos.tracing.meta')
  protected traceMetaResolver;

  async createClient(config: COS.COSOptions): Promise<COS> {
    assert.ok(
      config.SecretKey && config.SecretId,
      '[@midwayjs/cos] secretId secretKey is required on config'
    );
    this.logger.info('[midway:cos] init %s', config.SecretKey);

    const client = new COS(config);
    this.bindTraceContext(client);
    return client;
  }

  protected bindTraceContext(client: COS) {
    if (!client || !this.traceService) {
      return;
    }

    const rawRequest = (client as any).request?.bind(client);
    if (!rawRequest) {
      return;
    }

    (client as any).request = async (...args) => {
      if (typeof args[1] === 'function') {
        return rawRequest(...args);
      }
      const params = args?.[0] || {};
      const apiName = params.Action || params.action || 'request';
      return await this.traceService.runWithExitSpan(
        `cos.${String(apiName).toLowerCase()}`,
        {
          carrier: {},
          attributes: {
            'midway.protocol': 'cos',
            'midway.cos.action': String(apiName),
          },
          meta: this.traceMetaResolver,
          metaArgs: {
            request: params,
            custom: {
              action: String(apiName),
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

export interface COSService extends COS {
  // empty
}

delegateTargetPrototypeMethod(COSService, [COS]);
