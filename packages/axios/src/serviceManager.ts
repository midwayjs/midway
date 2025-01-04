import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios';
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
    await this.initClients(axiosConfig, {
      concurrent: true,
    });
  }

  protected async createClient(
    config: CreateAxiosDefaults,
    clientName: any
  ): Promise<AxiosInstance> {
    return axios.create(config);
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

  get defaults() {
    return this.instance.defaults;
  }

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

  request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.request(config);
  }

  get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.get(url, config);
  }

  delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.delete(url, config);
  }

  head<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.head(url, config);
  }

  options<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.options(url, config);
  }

  post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.post(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.put(url, data, config);
  }

  patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.patch(url, data, config);
  }

  postForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.postForm(url, data, config);
  }

  putForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.putForm(url, data, config);
  }

  patchForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.patchForm(url, data, config);
  }
}
