import axios from 'axios';
import * as Axios from 'axios';

export { AxiosConfiguration as Configuration } from './configuration';
export * from './http-service.factory';
export * from './http-service';
export * from './interface';
export {
  /**
   * @deprecated Use `Axios` directly
   */
  axios,
  Axios,
};
