import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { providerWrapper } from '@midwayjs/core/dist/context/providerWrapper';
import { ScopeEnum } from '@midwayjs/decorator';
import { IApplicationContext } from '@midwayjs/core/dist/interface';

export class HttpServiceFactory {

  static create(httpConfig: AxiosRequestConfig = {}): AxiosInstance {
    const instance = axios.create(httpConfig);

    // Add a request interceptor
    instance.interceptors.request.use(function (config) {
      // Do something before request is sent
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
    });

    // Add a response interceptor
    instance.interceptors.response.use(function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    }, function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    });

    return instance;
  }
}

providerWrapper([
  {
    id: 'httpService',
    provider: (context: IApplicationContext, args?: any) => {
      return HttpServiceFactory.create();
    },
    scope: ScopeEnum.Singleton,
    isAutowire: true,
  }
]);
