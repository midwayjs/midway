import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Config, Init, Inject, Provide } from '@midwayjs/decorator';
import { delegateTargetMethod, MidwayTracingService, ServiceFactory } from '@midwayjs/core';

@Provide()
export class HttpServiceFactory extends ServiceFactory<AxiosInstance> {
  @Config('axios')
  protected httpConfig;

  @Init()
  protected async init() {
    let config = this.httpConfig;
    if (
      !this.httpConfig['default'] &&
      (!this.httpConfig['client'] || !this.httpConfig['clients'])
    ) {
      config = {
        default: {},
        clients: {
          default: this.httpConfig,
        },
      };
    }
    await this.initClients(config);
  }

  protected async createClient(
    config: AxiosRequestConfig
  ): Promise<AxiosInstance> {
    return axios.create(config);
  }

  getName(): string {
    return 'axios';
  }
}

@Provide()
export class HttpService implements AxiosInstance {
  private instance: AxiosInstance;

  @Inject()
  serviceFactory: HttpServiceFactory;

  @Inject()
  ctx;

  @Inject()
  tracingService: MidwayTracingService;

  get interceptors() {
    return this.instance.interceptors;
  }

  @Init()
  protected async init() {
    this.instance = this.serviceFactory.get('default');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpService extends AxiosInstance {
  // empty
}

delegateTargetMethod(HttpService, [
  'getUri',
  'get',
  'delete',
  'head',
  'options',
  'post',
  'put',
  'patch',
]);

HttpService.prototype['request'] = function (...args) {
  let span;
  if (this.ctx) {
    span.context.active();
    span = this.tracingService.startSpan(name, options, ctx);
  }
  try {
    return this.instance['request'](...args);
  } finally {
    span.setAttributes(responseAttributes);
    span.setStatus(status);
    span?.end();
  }
};
