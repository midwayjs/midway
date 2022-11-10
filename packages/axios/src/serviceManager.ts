import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as axios from 'axios';
import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  MidwayCommonError,
  ServiceFactory,
} from '@midwayjs/core';
import { AxiosHttpService } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HttpServiceFactory extends ServiceFactory<AxiosInstance> {
  @Config('axios')
  axiosConfig;

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

  protected async createClient(
    config: AxiosRequestConfig,
    clientName: any
  ): Promise<AxiosInstance> {
    return (axios as any).create(config);
  }

  getName(): string {
    return 'axios';
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class HttpService implements AxiosHttpService {
  private instance: AxiosInstance;

  @Inject()
  private serviceFactory: HttpServiceFactory;

  get interceptors() {
    return this.instance.interceptors;
  }

  @Init()
  protected async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('axios default instance not found.');
    }
  }

  getUri(config?: AxiosRequestConfig): string {
    return this.instance.getUri(config);
  }

  request<T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.request(config);
  }

  get<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.get(url, config);
  }

  delete<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.delete(url, config);
  }

  head<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.head(url, config);
  }

  options<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.options(url, config);
  }

  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.post(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.put(url, data, config);
  }

  patch<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.patch(url, data, config);
  }
}
