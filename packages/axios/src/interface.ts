import {
  AxiosRequestConfig as OriginAxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse as OriginAxiosResponse
} from 'axios';

/**
 * Interface for custom axios request config merging.
 */
export interface AxiosRequestConfig<D = any> extends OriginAxiosRequestConfig<D> {}
export interface AxiosResponse<T = any, D = any> extends OriginAxiosResponse<T, D> {
  config: AxiosRequestConfig<D> & {
    headers: AxiosRequestHeaders;
  };
}
