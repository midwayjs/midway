import {
  Config,
  Init,
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
    return axios.create(config);
  }
}
