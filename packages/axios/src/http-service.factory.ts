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
      if (this.traceService) {
        requestConfig.headers =
          requestConfig.headers || new axios.AxiosHeaders();
        this.traceService.injectContext(requestConfig.headers);
      }
      return requestConfig;
    });
    return client;
  }
}
