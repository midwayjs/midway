import {
  Init,
  Inject,
  MidwayCommonError,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { Axios, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpServiceFactory } from './http-service.factory';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HttpService implements Axios {
  private instance: AxiosInstance;

  @Inject()
  private serviceFactory: HttpServiceFactory;

  @Init()
  protected async init() {
    const clientName = this.serviceFactory.getDefaultClientName() || 'default';

    this.instance = this.serviceFactory.get(clientName);
    if (!this.instance) {
      throw new MidwayCommonError('axios default instance not found.');
    }
  }
  get defaults() {
    return this.instance.defaults;
  }

  get interceptors() {
    return this.instance.interceptors;
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
