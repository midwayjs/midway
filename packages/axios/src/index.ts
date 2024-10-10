import * as axios from 'axios';
import * as Axios from 'axios';

export { AxiosConfiguration as Configuration } from './configuration';
export * from './interface';
export * from './serviceManager';
export {
  /**
   * @deprecated Use `Axios` directly
   */
  axios,
};
export { Axios };
