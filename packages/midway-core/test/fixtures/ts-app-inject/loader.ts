import { provide } from 'injection';


export interface Loader {
  getConfig()
}

@provide('loader')
export class BaseLoader implements Loader {
  getConfig() {
    return { a: 1, b: 2 };
  }
}

@provide('easyLoader')
export class EasyLoader extends BaseLoader implements Loader {
  getConfig() {
    return { a: 3, b: 4 };
  }
}
