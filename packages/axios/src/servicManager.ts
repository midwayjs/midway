import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { Provide, Inject, Init, Config, App } from '@midwayjs/decorator';
import { IMidwayApplication } from '@midwayjs/core';
import { AXIOS_INSTANCE_KEY, AxiosHttpService } from './interface';

@Provide()
export class HttpService implements AxiosHttpService {
  private instance: AxiosInstance;

  @Inject()
  ctx: any;

  @App()
  app: IMidwayApplication;

  @Config('axios')
  httpConfig: AxiosRequestConfig;

  get interceptors() {
    return this.instance.interceptors;
  }

  @Init()
  async init() {
    if (
      !this.app.getApplicationContext().registry.hasObject(AXIOS_INSTANCE_KEY)
    ) {
      // 动态往全局容器中创建一个单例
      const instance = axios.create(this.httpConfig ?? {});

      // Add a request interceptor
      instance.interceptors.request.use(
        config => {
          // Do something before request is sent
          return config;
        },
        error => {
          // Do something with request error
          return Promise.reject(error);
        }
      );

      // Add a response interceptor
      instance.interceptors.response.use(
        response => {
          // Any status code that lie within the range of 2xx cause this function to trigger
          // Do something with response data
          return response;
        },
        error => {
          // Any status codes that falls outside the range of 2xx cause this function to trigger
          // Do something with response error
          return Promise.reject(error);
        }
      );

      this.app
        .getApplicationContext()
        .registry.registerObject(AXIOS_INSTANCE_KEY, instance);
    }

    this.instance = this.app
      .getApplicationContext()
      .registry.getObject(AXIOS_INSTANCE_KEY);
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
    return this.instance.post(url, config);
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.put(url, config);
  }

  patch<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.instance.patch(url, config);
  }
}
