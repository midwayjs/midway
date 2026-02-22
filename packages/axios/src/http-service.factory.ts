import {
  Config,
  Inject,
  Init,
  MidwayTraceService,
  Provide,
  Scope,
  ScopeEnum,
  ServiceFactory,
} from '@midwayjs/core';
import * as axios from 'axios';
import { AxiosInstance, CreateAxiosDefaults } from 'axios';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HttpServiceFactory extends ServiceFactory<AxiosInstance> {
  @Config('axios')
  axiosConfig: any;

  @Config('axios.tracing.enable')
  traceEnabled: boolean;

  @Config('axios.tracing.injector')
  traceInjector: (args: {
    request?: unknown;
    custom?: Record<string, unknown>;
  }) => any;

  @Inject()
  traceService: MidwayTraceService;

  @Init()
  async init() {
    let axiosConfig = this.axiosConfig;
    if (!this.axiosConfig['clients']) {
      axiosConfig = {
        default: {},
        clients: {
          default: this.axiosConfig,
        },
      };
    }
    await this.initClients(axiosConfig);
  }
  public getName(): string {
    return 'axios';
  }

  protected async createClient(
    config: CreateAxiosDefaults,
    clientName: string
  ): Promise<AxiosInstance> {
    const client = axios.create(config);
    client.interceptors.request.use(requestConfig => {
      if (this.traceService && this.traceEnabled !== false) {
        const configuredCarrier =
          typeof this.traceInjector === 'function'
            ? this.traceInjector({
                request: requestConfig,
                custom: {
                  clientName,
                },
              })
            : undefined;
        const carrier =
          configuredCarrier ??
          requestConfig.headers ??
          new axios.AxiosHeaders();
        requestConfig.headers = carrier;
        this.traceService.injectContext(carrier);
      }
      return requestConfig;
    });
    return client;
  }
}
