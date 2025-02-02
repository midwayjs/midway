import * as axios from 'axios';
const Axios = axios['default'];

export { AxiosConfiguration as Configuration } from './configuration';
export * from './http-service.factory';
export * from './http-service';
export * from './interface';
export { Axios };
