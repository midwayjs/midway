import {Provide} from '@midwayjs/core';

export interface Loader {
  getConfig();
}

@Provide('loader')
export class BaseLoader implements Loader {
  getConfig() {
    return {a: 1, b: 2};
  }
}

@Provide('easyLoader')
export class EasyLoader extends BaseLoader implements Loader {
  getConfig() {
    return {a: 3, b: 4};
  }
}
