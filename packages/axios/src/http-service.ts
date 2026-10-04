import {
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  MidwayCommonError,
} from '@midwayjs/core';
import { AxiosInstance } from 'axios';
import { HttpServiceFactory } from './http-service.factory';
import { AxiosRequestConfig, AxiosResponse } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class HttpService {
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

  // Axios 1.20 uses a private default-response sentinel in its conditional return
  // type. Keep the public Promise<R> contract for callers and response interceptors.
  request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.request<T, R, D>(config) as Promise<R>;
  }

  get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.get<T, R, D>(url, config) as Promise<R>;
  }

  delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.delete<T, R, D>(url, config) as Promise<R>;
  }

  head<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.head<T, R, D>(url, config) as Promise<R>;
  }

  options<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.options<T, R, D>(url, config) as Promise<R>;
  }

  post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.post<T, R, D>(url, data, config) as Promise<R>;
  }

  put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.put<T, R, D>(url, data, config) as Promise<R>;
  }

  patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.patch<T, R, D>(url, data, config) as Promise<R>;
  }

  postForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.postForm<T, R, D>(url, data, config) as Promise<R>;
  }

  putForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.putForm<T, R, D>(url, data, config) as Promise<R>;
  }

  patchForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.patchForm<T, R, D>(url, data, config) as Promise<R>;
  }
}

export interface HttpService extends AxiosInstance {}
